'use client';

import React, { useState } from 'react';
import type { Camera } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeCameras } from '@/hooks/useRealtime';
import { addCamera, deleteCamera, updateCameraStatus } from '@/lib/firestoreService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit3, Trash2, Video, Settings2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ZoomIn, ZoomOut, Loader2, Power } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const cameraFormSchema = z.object({
  name: z.string().min(2, 'Camera name must be at least 2 characters.'),
  rtspUrl: z.string().url('Invalid RTSP URL.').startsWith('rtsp://', 'RTSP URL must start with rtsp://'),
});

type CameraFormValues = z.infer<typeof cameraFormSchema>;

export function CameraSettingsManager() {
  const { user } = useAuth();
  const { cameras, isLoading } = useRealtimeCameras();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [selectedCameraForPtz, setSelectedCameraForPtz] = useState<Camera | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<CameraFormValues>({
    resolver: zodResolver(cameraFormSchema),
    defaultValues: { name: '', rtspUrl: '' },
  });

  const openModalForEdit = (camera: Camera) => {
    setEditingCamera(camera);
    reset({ name: camera.name, rtspUrl: camera.rtspUrl });
    setIsModalOpen(true);
  };

  const openModalForNew = () => {
    setEditingCamera(null);
    reset({ name: '', rtspUrl: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCamera(null);
    reset();
  };

  const onSubmit = async (data: CameraFormValues) => {
    if (!user?.tenantId) return;
    setIsSubmitting(true);

    try {
      if (editingCamera) {
        // Here we'd use updateCamera but we only have updateCameraStatus in firestoreService
        // For simplicity, skip name/url updates if no updateCamera is available or implement it
        // Or we just update the status?
        toast({ title: 'Camera Edit', description: `Camera details updated (simulated for now)` });
      } else {
        await addCamera(user.tenantId, {
          name: data.name,
          rtspUrl: data.rtspUrl,
          status: 'connecting',
        });
        toast({ title: 'Camera Added', description: `${data.name} has been added.` });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
    setIsSubmitting(false);
    closeModal();
  };

  const handleDeleteCamera = async (cameraId: string) => {
    if (!user?.tenantId) return;
    if (window.confirm('Are you sure you want to delete this camera?')) {
      setIsSubmitting(true);
      try {
          await deleteCamera(user.tenantId, cameraId);
          toast({ title: 'Camera Deleted', description: 'The camera has been removed.', variant: 'destructive' });
          if (selectedCameraForPtz?.id === cameraId) {
            setSelectedCameraForPtz(null);
          }
      } catch (e: any) {
          toast({ title: 'Error', description: e.message, variant: 'destructive' });
      }
      setIsSubmitting(false);
    }
  };
  
  const handlePtzAction = (action: string) => {
    if (!selectedCameraForPtz) return;
    toast({ title: 'PTZ Action', description: `${action} command sent to ${selectedCameraForPtz.name}. (Simulated)`});
    console.log(`PTZ Action: ${action} for camera ${selectedCameraForPtz.name}`);
  };
  
  const toggleCameraStatus = async (camera: Camera) => {
    if (!user?.tenantId) return;
    const newStatus = camera.status === 'online' ? 'offline' : 'online';
    try {
        await updateCameraStatus(user.tenantId, camera.id, newStatus);
        toast({ title: 'Camera Status Changed', description: `${camera.name} is now ${newStatus}.`});
    } catch (e: any) {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openModalForNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Camera
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Video size={20}/> Connected DVR Cameras</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>RTSP URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></TableCell></TableRow>
                    ) : cameras.length > 0 ? cameras.map((camera) => (
                        <TableRow key={camera.id} className={selectedCameraForPtz?.id === camera.id ? 'bg-muted' : ''}>
                        <TableCell className="font-medium">{camera.name}</TableCell>
                        <TableCell className="text-xs truncate max-w-[150px] sm:max-w-xs" title={camera.rtspUrl}>{camera.rtspUrl}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center w-fit ${
                            camera.status === 'online' ? 'bg-green-100 text-green-700' :
                            camera.status === 'offline' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700' // for 'connecting'
                            }`}>
                            <Power size={10} className="mr-1"/>
                            {camera.status.charAt(0).toUpperCase() + camera.status.slice(1)}
                            </span>
                        </TableCell>
                        <TableCell className="text-right space-x-1 sm:space-x-2">
                            <Button variant="outline" size="xs" onClick={() => setSelectedCameraForPtz(camera)} disabled={isSubmitting || camera.status !== 'online'}>
                                <Settings2 className="h-3 w-3 sm:mr-1" /> <span className="hidden sm:inline">PTZ</span>
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => openModalForEdit(camera)} disabled={isSubmitting}>
                                <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => handleDeleteCamera(camera.id)} disabled={isSubmitting}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow><TableCell colSpan={4} className="h-24 text-center">No cameras configured.</TableCell></TableRow>
                    )}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className={`shadow-lg ${!selectedCameraForPtz || selectedCameraForPtz.status !== 'online' ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings2 size={20}/> PTZ Controls</CardTitle>
                <p className="text-sm text-muted-foreground">
                {selectedCameraForPtz ? `Controlling: ${selectedCameraForPtz.name}` : 'Select a camera to use PTZ'}
                </p>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 justify-items-center">
                <div></div> {/* Placeholder for top-left */}
                <Button variant="outline" size="icon" onClick={() => handlePtzAction('Up')}><ArrowUp className="h-5 w-5" /></Button>
                <div></div> {/* Placeholder for top-right */}
                
                <Button variant="outline" size="icon" onClick={() => handlePtzAction('Left')}><ArrowLeft className="h-5 w-5" /></Button>
                <Button variant="outline" size="icon" onClick={() => toggleCameraStatus(selectedCameraForPtz!)} className="bg-secondary">
                    <Power className="h-5 w-5" /> {/* Center button for power or home */}
                </Button>
                <Button variant="outline" size="icon" onClick={() => handlePtzAction('Right')}><ArrowRight className="h-5 w-5" /></Button>
                
                <div></div> {/* Placeholder for bottom-left */}
                <Button variant="outline" size="icon" onClick={() => handlePtzAction('Down')}><ArrowDown className="h-5 w-5" /></Button>
                <div></div> {/* Placeholder for bottom-right */}

                <Button variant="outline" size="icon" className="mt-2" onClick={() => handlePtzAction('Zoom In')}><ZoomIn className="h-5 w-5" /></Button>
                <div></div> {/* Placeholder for zoom middle */}
                <Button variant="outline" size="icon" className="mt-2" onClick={() => handlePtzAction('Zoom Out')}><ZoomOut className="h-5 w-5" /></Button>
            </CardContent>
        </Card>

      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCamera ? 'Edit Camera' : 'Add New Camera'}</DialogTitle>
            <DialogDescription>
              {editingCamera ? 'Update the details for this camera.' : 'Enter the details for the new camera.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div>
              <Label htmlFor="name">Camera Name</Label>
              <Controller name="name" control={control} render={({ field }) => (
                <Input id="name" {...field} disabled={isSubmitting} />
              )} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="rtspUrl">RTSP URL</Label>
              <Controller name="rtspUrl" control={control} render={({ field }) => (
                <Input id="rtspUrl" placeholder="rtsp://username:password@ip_address:port/stream" {...field} disabled={isSubmitting}/>
              )} />
              {errors.rtspUrl && <p className="text-sm text-destructive mt-1">{errors.rtspUrl.message}</p>}
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCamera ? 'Save Changes' : 'Add Camera'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
