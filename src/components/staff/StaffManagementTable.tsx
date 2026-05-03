
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { StaffMember, Recognition, SignInSignOutRecord, Branch } from '@/lib/types';
import { mockBranches } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeStaff, useRealtimeRecognitions, useRealtimeAttendance, useRealtimeCameras } from '@/hooks/useRealtime';
import { addStaffMember, updateStaffMember, deleteStaffMember, addAttendanceEvent } from '@/lib/firestoreService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit3, Trash2, Loader2, UploadCloud, Award, Sparkles, AlertTriangle, UserRoundCheck, Info, Clock, UserCog, MapPin } from 'lucide-react';
import Image from 'next/image';
import { generatePerformanceHighlights, GeneratePerformanceHighlightsInput, GeneratePerformanceHighlightsOutput } from '@/ai/flows/generate-performance-highlights';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StaffIdCard } from './StaffIdCard';

const staffFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  imageUrl: z.string().url('Invalid image URL.').optional().or(z.literal('')),
  department: z.string().optional(),
  branchId: z.string().optional(),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

interface StaffManagementTableProps {}

const ClientSideFormattedTimestamp = ({ isoTimestamp }: { isoTimestamp: string }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  useEffect(() => {
    setFormattedDate(new Date(isoTimestamp).toLocaleString());
  }, [isoTimestamp]);
  if (formattedDate === null) return <span className="text-xs text-muted-foreground">Loading...</span>;
  return <>{formattedDate}</>;
};

const tableHeaders = [
  { key: 'image', label: 'Image' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'department', label: 'Department' },
  { key: 'branch', label: 'Branch' },
  { key: 'status', label: 'Status' },
  { 
    key: 'recognitions', 
    label: (
      <div className="flex items-center justify-center">
        <Award size={16} className="mr-1"/> Recognitions
      </div>
    ),
    className: "text-center" 
  },
  { key: 'actions', label: 'Actions', className: "text-right" },
];

const NO_BRANCH_VALUE = "__NO_BRANCH_ASSIGNED__";


export function StaffManagementTable({}: StaffManagementTableProps) {
  const { user } = useAuth();
  const { staff: staffList, isLoading: loadingStaff } = useRealtimeStaff();
  const { recognitions } = useRealtimeRecognitions();
  const { attendance: allAttendance } = useRealtimeAttendance();
  const { cameras } = useRealtimeCameras();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [isHighlightsModalOpen, setIsHighlightsModalOpen] = useState(false);
  const [currentStaffForHighlights, setCurrentStaffForHighlights] = useState<StaffMember | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [isFetchingHighlights, setIsFetchingHighlights] = useState(false);
  const [highlightsError, setHighlightsError] = useState<string | null>(null);

  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [newlyRegisteredStaff, setNewlyRegisteredStaff] = useState<StaffMember | null>(null);

  const [isAttendanceLogModalOpen, setIsAttendanceLogModalOpen] = useState(false);
  const [selectedStaffForAttendance, setSelectedStaffForAttendance] = useState<StaffMember | null>(null);
  const [individualAttendanceLog, setIndividualAttendanceLog] = useState<SignInSignOutRecord[]>([]);
  const [lastClockAction, setLastClockAction] = useState<'signin' | 'signout'>('signout');


  const { toast } = useToast();
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: { name: '', email: '', imageUrl: '', department: '', branchId: '' },
  });
  
  const currentImageUrl = watch('imageUrl');

  useEffect(() => {
    if (editingStaff) {
      setPreviewImage(editingStaff.imageUrl || currentImageUrl || null);
    } else {
       setPreviewImage(currentImageUrl || null);
    }
  }, [editingStaff, currentImageUrl]);
  
  useEffect(() => {
    if (selectedStaffForAttendance) {
      const logs = allAttendance
        .filter(log => log.staffMemberId === selectedStaffForAttendance.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setIndividualAttendanceLog(logs);
      if (logs.length > 0 && logs[0].type === 'signin') {
        setLastClockAction('signin');
      } else {
        setLastClockAction('signout');
      }
    }
  }, [selectedStaffForAttendance, allAttendance]);


  const recognitionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    recognitions.forEach(recognition => {
      counts[recognition.receiver.id] = (counts[recognition.receiver.id] || 0) + 1;
    });
    return counts;
  }, [recognitions]);

  const openModalForEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    reset({ name: staff.name, email: staff.email, imageUrl: staff.imageUrl || '', department: staff.department || '', branchId: staff.branchId || '' });
    setIsModalOpen(true);
  };

  const openModalForNew = () => {
    setEditingStaff(null);
    reset({ name: '', email: '', imageUrl: '', department: '', branchId: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    reset();
    setPreviewImage(null);
  };

  const onSubmit = async (data: StaffFormValues) => {
    if (!user?.tenantId) return;
    setIsSubmitting(true);

    try {
      if (editingStaff) {
        const imageInput = document.getElementById('imageFile') as HTMLInputElement;
        const file = imageInput?.files?.[0];
        
        await updateStaffMember(user.tenantId, editingStaff.id, data, file);
        toast({ title: 'Staff Updated', description: `${data.name} has been updated.` });
        closeModal();
      } else {
        const imageInput = document.getElementById('imageFile') as HTMLInputElement;
        const file = imageInput?.files?.[0];
        
        const newStaff = await addStaffMember(user.tenantId, {
          name: data.name,
          email: data.email,
          imageUrl: data.imageUrl || '',
          department: data.department || '',
          branchId: data.branchId || '',
          status: 'active'
        }, file);
        
        toast({
          title: 'Staff Registered!',
          description: `${newStaff.name} has been successfully added.`,
          action: <UserRoundCheck className="h-5 w-5 text-green-500" />,
        });
        setNewlyRegisteredStaff(newStaff as StaffMember);
        setIsIdCardModalOpen(true);
        closeModal();
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
    setIsSubmitting(false);
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!user?.tenantId) return;
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      setIsSubmitting(true); 
      try {
          await deleteStaffMember(user.tenantId, staffId);
          toast({ title: 'Staff Deleted', description: 'The staff member has been removed.', variant: 'destructive' });
      } catch (e: any) {
          toast({ title: 'Error', description: e.message, variant: 'destructive' });
      }
      setIsSubmitting(false);
    }
  };
  
  const handleImageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setValue('imageUrl', result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShowHighlights = async (staff: StaffMember) => {
    setCurrentStaffForHighlights(staff);
    setIsHighlightsModalOpen(true);
    setIsFetchingHighlights(true);
    setHighlightsError(null);
    setHighlights([]);

    try {
      const staffRecognitions = recognitions.filter(rec => rec.receiver.id === staff.id);
      if (staffRecognitions.length === 0) {
        setHighlights(["This staff member has not received any recognitions yet."]);
        setIsFetchingHighlights(false);
        return;
      }

      const recognitionDetails = staffRecognitions.map(rec => 
        `Recognized for "${rec.value || 'General Excellence'}": ${rec.reason}${rec.message ? ' Personal note: ' + rec.message : ''}`
      );
      
      const input: GeneratePerformanceHighlightsInput = {
        staffName: staff.name,
        recognitionDetails: recognitionDetails,
      };
      const result: GeneratePerformanceHighlightsOutput = await generatePerformanceHighlights(input);
      setHighlights(result.highlights);
    } catch (error) {
      console.error("Error fetching AI highlights:", error);
      setHighlightsError("Failed to generate performance highlights. Please try again.");
      toast({
        variant: "destructive",
        title: "AI Highlights Error",
        description: "Could not generate performance highlights at this time.",
      });
    } finally {
      setIsFetchingHighlights(false);
    }
  };

  const handleShowAttendanceLog = (staff: StaffMember) => {
    setSelectedStaffForAttendance(staff);
    setIsAttendanceLogModalOpen(true);
  };
  
  const handleSimulateClockAction = async () => {
    if (!selectedStaffForAttendance || !user?.tenantId) return;
    
    const newActionType = lastClockAction === 'signout' ? 'signin' : 'signout';
    
    let cameraName: string = "Phone Camera";
    if (cameras.length > 0 && Math.random() < 0.5) { 
        const randomCameraFromList = cameras[Math.floor(Math.random() * cameras.length)];
        cameraName = randomCameraFromList.name;
    }

    try {
        await addAttendanceEvent(user.tenantId, {
            staffMemberId: selectedStaffForAttendance.id,
            staffName: selectedStaffForAttendance.name,
            timestamp: new Date().toISOString(),
            type: newActionType,
            camera: cameraName,
            branchId: selectedStaffForAttendance.branchId,
        });
        toast({
            title: `${newActionType.charAt(0).toUpperCase() + newActionType.slice(1)} Recorded`,
            description: `${selectedStaffForAttendance.name} ${newActionType === 'signin' ? 'clocked in' : 'clocked out'} at ${cameraName}.`,
        });
    } catch (e: any) {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };


  const filteredStaff = staffList.filter(staff => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (staff.department && staff.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (staff.branchId && mockBranches.find(b => b.id === staff.branchId)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ).map(staff => ({
    ...staff,
    recognitionsReceived: recognitionCounts[staff.id] || 0,
    branchName: staff.branchId ? mockBranches.find(b => b.id === staff.branchId)?.name : undefined,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Input 
          placeholder="Search staff by name, email, department, or branch..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md text-sm"
        />
        <Button onClick={openModalForNew} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Staff
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {tableHeaders.map(header => (
                <TableHead key={header.key} className={header.className}>
                  {header.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={staff.imageUrl} alt={staff.name} data-ai-hint="person photo" />
                    <AvatarFallback>{staff.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{staff.name}</TableCell>
                <TableCell>{staff.email}</TableCell>
                <TableCell>{staff.department || 'N/A'}</TableCell>
                <TableCell>{staff.branchName || 'N/A'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    staff.status === 'recognized' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
                    staff.status === 'unknown' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 
                    'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  }`}>
                    {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-center font-medium">
                  {staff.recognitionsReceived}
                </TableCell>
                <TableCell className="text-right space-x-1">
                   <Button variant="outline" size="xs" onClick={() => handleShowAttendanceLog(staff)} disabled={isSubmitting}>
                    <Clock className="h-3 w-3 sm:mr-1" /> <span className="hidden sm:inline">Attendance</span>
                  </Button>
                  <Button variant="outline" size="xs" onClick={() => handleShowHighlights(staff)} disabled={isSubmitting || isFetchingHighlights}>
                    <Sparkles className="h-3 w-3 sm:mr-1" /> <span className="hidden sm:inline">AI Highlights</span>
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => openModalForEdit(staff)} disabled={isSubmitting}>
                    <Edit3 className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteStaff(staff.id)} disabled={isSubmitting}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
            ) : (
               <TableRow>
                <TableCell colSpan={tableHeaders.length} className="h-24 text-center text-muted-foreground">
                  No staff members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                {editingStaff ? <UserCog className="h-5 w-5" /> : <UserRoundCheck className="h-5 w-5 text-primary" />}
                {editingStaff ? 'Edit Staff Member' : 'Register New Staff Member'}
            </DialogTitle>
            <DialogDescription>
              {editingStaff ? 'Update the details for this staff member.' : 'Complete the form to register a new staff member.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Controller name="name" control={control} render={({ field }) => (
                  <Input id="name" {...field} disabled={isSubmitting} />
              )} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Controller name="email" control={control} render={({ field }) => (
                  <Input id="email" type="email" {...field} disabled={isSubmitting} />
              )} />
               {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
             <div>
              <Label htmlFor="department">Department (Optional)</Label>
              <Controller name="department" control={control} render={({ field }) => (
                  <Input id="department" {...field} disabled={isSubmitting} />
              )} />
               {errors.department && <p className="text-sm text-destructive mt-1">{errors.department.message}</p>}
            </div>
            <div>
              <Label htmlFor="branchId">Branch Assignment (Optional)</Label>
              <Controller
                name="branchId"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={(value) => {
                      if (value === NO_BRANCH_VALUE) {
                        field.onChange(''); 
                      } else {
                        field.onChange(value);
                      }
                    }} 
                    value={field.value ? field.value : NO_BRANCH_VALUE} 
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="branchId">
                      <SelectValue placeholder="Select a branch (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_BRANCH_VALUE}>No Branch / Not Applicable</SelectItem>
                      {mockBranches.map((branch: Branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} ({branch.location || 'Main'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.branchId && <p className="text-sm text-destructive mt-1">{errors.branchId.message}</p>}
            </div>
            <div>
                <Label htmlFor="imageUrl">Profile Image</Label>
                <div className="mt-1 flex items-center gap-4">
                    {(previewImage) && (
                        <Image 
                            src={previewImage}
                            alt="Profile preview"
                            width={64} height={64}
                            className="h-16 w-16 rounded-full object-cover border-2 border-muted"
                            data-ai-hint="person photo"
                            onError={() => setPreviewImage('https://placehold.co/64x64.png?text=Error')}
                        />
                    )}
                    <Input 
                        id="imageFile" 
                        type="file" 
                        accept="image/png, image/jpeg, image/webp, image/gif"
                        onChange={handleImageInputChange}
                        className="hidden" 
                        disabled={isSubmitting}
                    />
                     <Button type="button" variant="outline" onClick={() => document.getElementById('imageFile')?.click()} disabled={isSubmitting}>
                        <UploadCloud className="mr-2 h-4 w-4" /> Upload Image
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Or paste image URL below (PNG, JPG, WEBP, GIF supported).</p>
                 <Controller name="imageUrl" control={control} render={({ field }) => (
                    <Input 
                        id="imageUrl" 
                        placeholder="Paste image URL (e.g., https://example.com/image.png)"
                        value={field.value || ''}
                        onChange={(e) => {
                            field.onChange(e);
                            setPreviewImage(e.target.value);
                        }}
                        className="mt-1 text-xs"
                        disabled={isSubmitting}
                    />
                )} />
                 {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingStaff ? 'Save Changes' : 'Register Staff'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isHighlightsModalOpen} onOpenChange={setIsHighlightsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary" />
              AI Performance Highlights
            </DialogTitle>
            <DialogDescription>
              For: {currentStaffForHighlights?.name || 'Staff Member'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] py-4">
            {isFetchingHighlights && (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-muted-foreground">Generating highlights...</p>
              </div>
            )}
            {highlightsError && (
              <div className="text-destructive flex items-center gap-2">
                <AlertTriangle size={18} /> 
                <p>{highlightsError}</p>
              </div>
            )}
            {!isFetchingHighlights && !highlightsError && highlights.length > 0 && (
              <ul className="space-y-2 list-disc pl-5 text-sm">
                {highlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            )}
             {!isFetchingHighlights && !highlightsError && highlights.length === 0 && currentStaffForHighlights && (
                 <p className="text-muted-foreground text-sm">No specific highlights could be generated. This staff member may have no recognitions or recognitions may lack detail.</p>
             )}
          </ScrollArea>
          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => setIsHighlightsModalOpen(false)}>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {newlyRegisteredStaff && (
        <Dialog open={isIdCardModalOpen} onOpenChange={setIsIdCardModalOpen}>
          <DialogContent className="sm:max-w-xs p-0 border-0 bg-transparent shadow-none">
            <StaffIdCard staff={newlyRegisteredStaff} />
            <DialogFooter className="sm:justify-center pt-4 px-6 pb-6 bg-background rounded-b-lg">
              <DialogClose asChild>
                <Button 
                  type="button" 
                  variant="default" 
                  onClick={() => {
                    setIsIdCardModalOpen(false);
                    setNewlyRegisteredStaff(null);
                  }}
                >
                  Done
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedStaffForAttendance && (
        <Dialog open={isAttendanceLogModalOpen} onOpenChange={setIsAttendanceLogModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Attendance Log: {selectedStaffForAttendance.name}
              </DialogTitle>
              <DialogDescription>
                Showing clock-in and clock-out records for this staff member. Assigned Branch: {mockBranches.find(b => b.id === selectedStaffForAttendance.branchId)?.name || 'N/A'}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] py-4 pr-2">
              {individualAttendanceLog.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Camera</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Snapshot</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {individualAttendanceLog.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <ClientSideFormattedTimestamp isoTimestamp={log.timestamp} />
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            log.type === 'signin' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            log.type === 'signout' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>{log.camera}</TableCell>
                        <TableCell>{log.branchName || 'N/A'}</TableCell>
                        <TableCell>
                          {log.snapshotImageUrl ? (
                            <Avatar className="h-8 w-8 rounded-sm">
                              <AvatarImage src={log.snapshotImageUrl} alt={log.staffName} data-ai-hint="person face" className="object-cover" />
                              <AvatarFallback className="rounded-sm text-xs">
                                {log.staffName.substring(0,2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No attendance records found for {selectedStaffForAttendance.name}.</p>
              )}
            </ScrollArea>
            <DialogFooter className="pt-2 justify-between">
               <Button 
                  variant="secondary" 
                  onClick={handleSimulateClockAction}
                  disabled={isSubmitting}
                >
                  <Clock className="mr-2 h-4 w-4"/> Simulate {lastClockAction === 'signout' ? 'Clock-In' : 'Clock-Out'}
               </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => setIsAttendanceLogModalOpen(false)}>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

    
