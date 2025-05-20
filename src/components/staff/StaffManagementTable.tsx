
'use client';

import React, { useState, useMemo } from 'react';
import type { StaffMember } from '@/lib/types';
import { mockStaffMembers, mockRecognitions } from '@/lib/mockData'; // Import mockRecognitions
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
import { PlusCircle, Edit3, Trash2, Loader2, UploadCloud, Award } from 'lucide-react'; // Added Award icon
import Image from 'next/image';

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

  const { toast } = useToast();
  const { control, handleSubmit, reset, setValue, watch } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: { name: '', email: '', imageUrl: '', department: '' },
  });
  
  const currentImageUrl = watch('imageUrl');

  const recognitionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mockRecognitions.forEach(recognition => {
      counts[recognition.receiver.id] = (counts[recognition.receiver.id] || 0) + 1;
    });
    return counts;
  }, []);

  const openModalForEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    reset({ name: staff.name, email: staff.email, imageUrl: staff.imageUrl, department: staff.department });
    setPreviewImage(staff.imageUrl);
    setIsModalOpen(true);
  };

  const openModalForNew = () => {
    setEditingStaff(null);
    reset({ name: '', email: '', imageUrl: '', department: '' });
    setPreviewImage(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    reset();
    setPreviewImage(null);
  };

  const onSubmit = async (data: StaffFormValues) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    if (editingStaff) {
      setStaffList(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...data, imageUrl: data.imageUrl || s.imageUrl } : s));
      toast({ title: 'Staff Updated', description: `${data.name} has been updated.` });
    } else {
      const newStaff: StaffMember = {
        id: `staff${staffList.length + 1 + Math.random()}`,
        ...data,
        imageUrl: data.imageUrl || `https://placehold.co/150x150.png?text=${data.name.substring(0,2).toUpperCase()}`,
        status: 'active', 
      };
      setStaffList(prev => [newStaff, ...prev]);
      toast({ title: 'Staff Added', description: `${data.name} has been added.` });
    }
    setIsSubmitting(false);
    closeModal();
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
        setPreviewImage(result);
        setValue('imageUrl', result, { shouldValidate: true }); 
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
      setValue('imageUrl', '', { shouldValidate: true });
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
                    staff.status === 'recognized' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : // Added dark mode classes
                    staff.status === 'unknown' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : // Added dark mode classes
                    'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' // Added dark mode classes
                  }`}>
                    {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-center font-medium">
                  {staff.recognitionsReceived}
                </TableCell>
                <TableCell className="text-right space-x-2">
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
            <DialogDescription>
              {editingStaff ? 'Update the details for this staff member.' : 'Enter the details for the new staff member.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Controller name="name" control={control} render={({ field, fieldState }) => (
                <>
                  <Input id="name" {...field} disabled={isSubmitting} />
                  {fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                </>
              )} />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Controller name="email" control={control} render={({ field, fieldState }) => (
                 <>
                  <Input id="email" type="email" {...field} disabled={isSubmitting} />
                  {fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                </>
              )} />
            </div>
             <div>
              <Label htmlFor="department">Department (Optional)</Label>
              <Controller name="department" control={control} render={({ field, fieldState }) => (
                 <>
                  <Input id="department" {...field} disabled={isSubmitting} />
                  {fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                </>
              )} />
            </div>
            <div>
                <Label htmlFor="imageUrl">Profile Image</Label>
                <div className="mt-1 flex items-center gap-4">
                    {(previewImage || currentImageUrl) && (
                        <Image 
                            src={previewImage || currentImageUrl || ''}
                            alt="Profile preview"
                            width={64} height={64}
                            className="h-16 w-16 rounded-full object-cover"
                            data-ai-hint="person photo"
                        />
                    )}
                    <Input 
                        id="imageFile" 
                        type="file" 
                        accept="image/png, image/jpeg"
                        onChange={handleImageInputChange}
                        className="hidden" 
                        disabled={isSubmitting}
                    />
                     <Button type="button" variant="outline" onClick={() => document.getElementById('imageFile')?.click()} disabled={isSubmitting}>
                        <UploadCloud className="mr-2 h-4 w-4" /> Upload Image
                    </Button>
                </div>
                 <Controller name="imageUrl" control={control} render={({ fieldState }) => (
                     fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>
                 )} />
                <p className="text-xs text-muted-foreground mt-1">Alternatively, you can paste an image URL below (for demo).</p>
                 <Controller name="imageUrl" control={control} render={({ field }) => (
                    <Input 
                        id="imageUrl" 
                        placeholder="Or paste image URL here"
                        value={field.value || ''}
                        onChange={(e) => {
                            field.onChange(e);
                            setPreviewImage(e.target.value);
                        }}
                        className="mt-1 text-xs"
                        disabled={isSubmitting}
                    />
                )} />
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingStaff ? 'Save Changes' : 'Add Staff'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


    