
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { StaffMember, Recognition } from '@/lib/types';
import { mockStaffMembers, mockRecognitions } from '@/lib/mockData'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit3, Trash2, Loader2, UploadCloud, Award, Sparkles, AlertTriangle, UserRoundCheck, Info } from 'lucide-react';
import Image from 'next/image';
import { generatePerformanceHighlights, GeneratePerformanceHighlightsInput, GeneratePerformanceHighlightsOutput } from '@/ai/flows/generate-performance-highlights';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StaffIdCard } from './StaffIdCard'; // Import the new ID card component

const staffFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  imageUrl: z.string().url('Invalid image URL.').optional().or(z.literal('')),
  department: z.string().optional(),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

interface StaffManagementTableProps {}

export function StaffManagementTable({}: StaffManagementTableProps) {
  const [staffList, setStaffList] = useState<StaffMember[]>(mockStaffMembers);
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


  const { toast } = useToast();
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: { name: '', email: '', imageUrl: '', department: '' },
  });
  
  const currentImageUrl = watch('imageUrl');

  // Re-initialize previewImage when editingStaff or currentImageUrl changes
  useEffect(() => {
    if (editingStaff) {
      setPreviewImage(editingStaff.imageUrl || currentImageUrl || null);
    } else {
       setPreviewImage(currentImageUrl || null);
    }
  }, [editingStaff, currentImageUrl]);

  const recognitionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mockRecognitions.forEach(recognition => {
      counts[recognition.receiver.id] = (counts[recognition.receiver.id] || 0) + 1;
    });
    return counts;
  }, []);

  const openModalForEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    reset({ name: staff.name, email: staff.email, imageUrl: staff.imageUrl || '', department: staff.department || '' });
    // setPreviewImage(staff.imageUrl); // This will be handled by useEffect
    setIsModalOpen(true);
  };

  const openModalForNew = () => {
    setEditingStaff(null);
    reset({ name: '', email: '', imageUrl: '', department: '' });
    // setPreviewImage(null); // This will be handled by useEffect
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    reset();
    setPreviewImage(null); // Explicitly clear preview on close
  };

  const onSubmit = async (data: StaffFormValues) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    if (editingStaff) {
      setStaffList(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...data, imageUrl: data.imageUrl || s.imageUrl || `https://placehold.co/150x150.png?text=${data.name.substring(0,2).toUpperCase()}` } : s));
      toast({ title: 'Staff Updated', description: `${data.name} has been updated.` });
      closeModal();
    } else {
      const newStaff: StaffMember = {
        id: `staff${staffList.length + 1}-${Math.random().toString(36).substring(2, 7)}`, // More unique ID
        ...data,
        imageUrl: data.imageUrl || `https://placehold.co/150x150.png?text=${data.name.substring(0,2).toUpperCase()}`,
        status: 'active', 
      };
      setStaffList(prev => [newStaff, ...prev]);
      toast({
        title: 'Staff Registered!',
        description: `${newStaff.name} has been successfully added.`,
        action: <UserRoundCheck className="h-5 w-5 text-green-500" />,
      });
      setNewlyRegisteredStaff(newStaff); // Store new staff for ID card
      setIsIdCardModalOpen(true); // Open ID card modal
      closeModal(); // Close registration modal
    }
    setIsSubmitting(false);
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      setIsSubmitting(true); 
      await new Promise(resolve => setTimeout(resolve, 500));
      setStaffList(prev => prev.filter(s => s.id !== staffId));
      toast({ title: 'Staff Deleted', description: 'The staff member has been removed.', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };
  
  const handleImageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result); // Update preview for immediate feedback
        setValue('imageUrl', result, { shouldValidate: true }); // Update form value
      };
      reader.readAsDataURL(file);
    } else {
      // If no file is selected (e.g., user cancels file dialog), don't clear potentially pasted URL
      // Only clear preview if user explicitly removes an uploaded image (not implemented here)
    }
  };

  const handleShowHighlights = async (staff: StaffMember) => {
    setCurrentStaffForHighlights(staff);
    setIsHighlightsModalOpen(true);
    setIsFetchingHighlights(true);
    setHighlightsError(null);
    setHighlights([]);

    try {
      const staffRecognitions = mockRecognitions.filter(rec => rec.receiver.id === staff.id);
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


  const filteredStaff = staffList.filter(staff => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (staff.department && staff.department.toLowerCase().includes(searchTerm.toLowerCase()))
  ).map(staff => ({
    ...staff,
    recognitionsReceived: recognitionCounts[staff.id] || 0,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Input 
          placeholder="Search staff by name, email, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm text-sm"
        />
        <Button onClick={openModalForNew} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Staff
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center">
                  <Award size={16} className="mr-1"/> Recognitions
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground"> 
                  No staff members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Staff Dialog (Registration Form) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                {editingStaff ? <Edit3 className="h-5 w-5" /> : <UserRoundCheck className="h-5 w-5 text-primary" />}
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
                <Label htmlFor="imageUrl">Profile Image</Label>
                <div className="mt-1 flex items-center gap-4">
                    {(previewImage) && ( // Use previewImage directly here
                        <Image 
                            src={previewImage}
                            alt="Profile preview"
                            width={64} height={64}
                            className="h-16 w-16 rounded-full object-cover border-2 border-muted"
                            data-ai-hint="person photo"
                            onError={() => setPreviewImage('https://placehold.co/64x64.png?text=Error')} // Fallback for broken image preview
                        />
                    )}
                    <Input 
                        id="imageFile" 
                        type="file" 
                        accept="image/png, image/jpeg, image/webp, image/gif" // Accept more image types
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
                            setPreviewImage(e.target.value); // Update preview when URL is typed/pasted
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

      {/* AI Performance Highlights Dialog */}
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

      {/* ID Card Display Dialog */}
      {newlyRegisteredStaff && (
        <Dialog open={isIdCardModalOpen} onOpenChange={setIsIdCardModalOpen}>
          <DialogContent className="sm:max-w-xs p-0 border-0 bg-transparent shadow-none">
            {/* DialogHeader and DialogTitle removed for a cleaner ID card presentation */}
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
    </div>
  );
}

