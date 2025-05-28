
'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, Edit3, Trash2, FileSignature, DollarSign, Loader2, Library } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SalaryTemplate {
  id: string;
  templateName: string;
  basePay: number;
  allowanceIds: string[]; // IDs of allowances from configuration
  deductionIds: string[]; // IDs of deduction rules from configuration
  description?: string;
}

// Mock data from payroll configuration (would typically be fetched or from context)
const mockAllowances = [
    { id: 'al1', name: 'Housing Allowance', type: 'fixed', value: 500 },
    { id: 'al2', name: 'Transport Allowance', type: 'fixed', value: 200 },
    { id: 'al3', name: 'Communication Allowance', type: 'percentage', value: 5 },
];
const mockDeductions = [
    { id: 'dd1', name: 'Lateness Penalty', description: 'Per hour of lateness', type: 'fixed', value: 10 },
    { id: 'dd2', name: 'Absence (Unexcused)', description: 'Per day of unexcused absence', type: 'fixed', value: 100 },
    { id: 'dd3', name: 'Standard Income Tax', description: 'Progressive tax', type: 'percentage'},
];


const templateFormSchema = z.object({
  templateName: z.string().min(3, 'Template name must be at least 3 characters.'),
  basePay: z.number().min(0, 'Base pay must be a positive number.'),
  allowanceIds: z.array(z.string()).optional(),
  deductionIds: z.array(z.string()).optional(),
  description: z.string().optional(),
});
type TemplateFormValues = z.infer<typeof templateFormSchema>;


export default function SalaryTemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<SalaryTemplate[]>([
    { id: 'temp1', templateName: 'Standard Staff Template', basePay: 45000, allowanceIds: ['al1', 'al2'], deductionIds: ['dd3'], description: 'For general staff members.' },
    { id: 'temp2', templateName: 'Senior Developer Template', basePay: 90000, allowanceIds: ['al1', 'al2', 'al3'], deductionIds: ['dd3'], description: 'For senior engineering roles.' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SalaryTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, setValue, watch } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: { templateName: '', basePay: 0, allowanceIds: [], deductionIds: [], description: '' },
  });

  const openModalForEdit = (template: SalaryTemplate) => {
    setEditingTemplate(template);
    reset({ 
        templateName: template.templateName, 
        basePay: template.basePay,
        allowanceIds: template.allowanceIds,
        deductionIds: template.deductionIds,
        description: template.description || ''
    });
    setIsModalOpen(true);
  };

  const openModalForNew = () => {
    setEditingTemplate(null);
    reset({ templateName: '', basePay: 0, allowanceIds: [], deductionIds: [], description: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    reset();
  };

  const onSubmit = async (data: TemplateFormValues) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...editingTemplate, ...data } : t));
      toast({ title: 'Template Updated', description: `Template "${data.templateName}" has been updated.` });
    } else {
      const newTemplate: SalaryTemplate = {
        id: `temp${templates.length + 1}_${Date.now()}`,
        ...data,
        allowanceIds: data.allowanceIds || [],
        deductionIds: data.deductionIds || [],
      };
      setTemplates(prev => [newTemplate, ...prev]);
      toast({ title: 'Template Created', description: `New template "${data.templateName}" added.` });
    }
    setIsSubmitting(false);
    closeModal();
  };
  
  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template? This is a mock action.')) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        toast({ title: 'Template Deleted (Mock)', description: 'The salary template has been removed.', variant: 'destructive' });
    }
  };


  return (
    <div className="space-y-8">
      <PageHeader
        title="Salary Templates Management"
        description="Create, view, and manage salary templates for different roles or staff categories."
        children={<FileSignature className="h-8 w-8 text-primary" />}
      />

      <div className="flex justify-end">
        <Button onClick={openModalForNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Library size={20}/> Existing Salary Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Base Pay</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length > 0 ? templates.map(template => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.templateName}</TableCell>
                  <TableCell>${template.basePay.toLocaleString()}</TableCell>
                  <TableCell className="text-xs">{template.allowanceIds.map(id => mockAllowances.find(a=>a.id === id)?.name).filter(Boolean).join(', ') || 'None'}</TableCell>
                  <TableCell className="text-xs">{template.deductionIds.map(id => mockDeductions.find(d=>d.id === id)?.name).filter(Boolean).join(', ') || 'None'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{template.description || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openModalForEdit(template)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteTemplate(template.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No salary templates created yet.
                    </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5 text-primary"/>
                {editingTemplate ? 'Edit Salary Template' : 'Create New Salary Template'}
            </DialogTitle>
            <DialogDescription>
              Define the structure for this salary template.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <ScrollArea className="max-h-[65vh] p-1 pr-3">
            <div className="space-y-4 p-2">
                <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Controller name="templateName" control={control} render={({ field }) => (
                    <Input id="templateName" placeholder="e.g., Junior Executive Template" {...field} disabled={isSubmitting} />
                )} />
                {control.formState.errors.templateName && <p className="text-sm text-destructive mt-1">{control.formState.errors.templateName.message}</p>}
                </div>

                <div>
                <Label htmlFor="basePay">Base Pay ($)</Label>
                <Controller name="basePay" control={control} render={({ field }) => (
                    <Input id="basePay" type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={isSubmitting} />
                )} />
                {control.formState.errors.basePay && <p className="text-sm text-destructive mt-1">{control.formState.errors.basePay.message}</p>}
                </div>

                <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Controller name="description" control={control} render={({ field }) => (
                        <Input id="description" placeholder="Brief description of this template" {...field} value={field.value || ''} disabled={isSubmitting} />
                    )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                        <Label className="mb-2 block font-medium">Select Allowances</Label>
                        <ScrollArea className="h-40 rounded-md border p-2">
                            <div className="space-y-1">
                            {mockAllowances.map(allowance => (
                                <Controller
                                    key={allowance.id}
                                    name="allowanceIds"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2 p-1.5 hover:bg-muted/50 rounded-md">
                                        <Checkbox
                                            id={`allowance-${allowance.id}`}
                                            checked={field.value?.includes(allowance.id)}
                                            onCheckedChange={(checked) => {
                                            const currentValues = field.value || [];
                                            return checked
                                                ? field.onChange([...currentValues, allowance.id])
                                                : field.onChange(currentValues.filter(id => id !== allowance.id));
                                            }}
                                            disabled={isSubmitting}
                                        />
                                        <Label htmlFor={`allowance-${allowance.id}`} className="text-sm font-normal cursor-pointer">
                                            {allowance.name} ({allowance.type === 'fixed' ? `$${allowance.value}` : `${allowance.value}%`})
                                        </Label>
                                        </div>
                                    )}
                                />
                            ))}
                            </div>
                        </ScrollArea>
                    </div>
                    <div>
                        <Label className="mb-2 block font-medium">Select Deductions</Label>
                         <ScrollArea className="h-40 rounded-md border p-2">
                            <div className="space-y-1">
                            {mockDeductions.map(deduction => (
                                <Controller
                                    key={deduction.id}
                                    name="deductionIds"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2 p-1.5 hover:bg-muted/50 rounded-md">
                                        <Checkbox
                                            id={`deduction-${deduction.id}`}
                                            checked={field.value?.includes(deduction.id)}
                                            onCheckedChange={(checked) => {
                                            const currentValues = field.value || [];
                                            return checked
                                                ? field.onChange([...currentValues, deduction.id])
                                                : field.onChange(currentValues.filter(id => id !== deduction.id));
                                            }}
                                            disabled={isSubmitting}
                                        />
                                        <Label htmlFor={`deduction-${deduction.id}`} className="text-sm font-normal cursor-pointer">
                                            {deduction.name}
                                        </Label>
                                        </div>
                                    )}
                                />
                            ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingTemplate ? 'Save Changes' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
