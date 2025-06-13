
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Save, Loader2, Building2 } from 'lucide-react';

export default function CompanyProfilePage() {
  const { toast } = useToast();
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>('Your Company');
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [previewNewLogoUrl, setPreviewNewLogoUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    // Load current logo and company name from localStorage
    try {
      const storedLogo = localStorage.getItem('falconT25CompanyLogoUrl');
      const companyDataString = localStorage.getItem('falconT25CompanyRegData');
      
      if (companyDataString) {
        const companyData = JSON.parse(companyDataString);
        setCompanyName(companyData.companyName || 'Your Company');
        // If no specific logo, construct one based on company name
        setCurrentLogoUrl(storedLogo || `https://placehold.co/150x150.png?text=${(companyData.companyName || 'CO').substring(0,2).toUpperCase()}`);
      } else {
        // Default if no company data found
        setCurrentLogoUrl(storedLogo || 'https://placehold.co/150x150.png?text=CO');
      }
    } catch (e) {
      console.error("Error reading from localStorage:", e);
      setCurrentLogoUrl('https://placehold.co/150x150.png?text=ERR');
    } finally {
        setIsLoadingData(false);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewNewLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setNewLogoFile(null);
      setPreviewNewLogoUrl(null);
    }
  };

  const handleSaveLogo = async () => {
    if (!newLogoFile && !previewNewLogoUrl) { // Allow saving even if URL was pasted directly, or clearing
        if (previewNewLogoUrl === null && newLogoFile === null) { // If both are null, means trying to clear
             try {
                localStorage.removeItem('falconT25CompanyLogoUrl');
                setCurrentLogoUrl(`https://placehold.co/150x150.png?text=${(companyName || 'CO').substring(0,2).toUpperCase()}`); // Reset to default placeholder
                setNewLogoFile(null);
                setPreviewNewLogoUrl(null);
                toast({ title: 'Logo Cleared', description: 'Company logo has been reset to default.' });
             } catch (e) {
                console.error("Error clearing logo from localStorage", e);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not clear logo.'});
             }
             return;
        }
        // If only URL was pasted and no file, use the preview URL
        if (previewNewLogoUrl && !newLogoFile) {
             try {
                localStorage.setItem('falconT25CompanyLogoUrl', previewNewLogoUrl);
                setCurrentLogoUrl(previewNewLogoUrl);
                toast({ title: 'Logo Updated!', description: 'Company logo has been updated from URL.' });
             } catch (e) {
                console.error("Error saving logo URL to localStorage", e);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not save logo from URL.'});
             }
             return;
        }
      toast({ variant: 'destructive', title: 'No New Logo', description: 'Please select a new logo file or provide a URL.' });
      return;
    }

    setIsSaving(true);
    // Simulate upload and save
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // In a real app, upload newLogoFile to a server and get a URL.
      // For this demo, we use the preview URL (data URL or pasted URL).
      const newUrlToSave = previewNewLogoUrl || currentLogoUrl; // Fallback in case something odd happens
      if(newUrlToSave) {
        localStorage.setItem('falconT25CompanyLogoUrl', newUrlToSave);
        setCurrentLogoUrl(newUrlToSave); // Update displayed current logo
      }
      setNewLogoFile(null); // Clear selection
      // setPreviewNewLogoUrl(null); // Keep preview until next change or save
      toast({ title: 'Logo Updated!', description: 'Your company logo has been (simulated) updated.' });
    } catch (e) {
      console.error("Error saving logo to localStorage:", e);
      toast({ variant: 'destructive', title: 'Save Error', description: 'Could not save the new logo.' });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    if (url) {
        setPreviewNewLogoUrl(url); // Use the URL as preview directly
        setNewLogoFile(null); // Clear any selected file if URL is provided
    } else {
        setPreviewNewLogoUrl(null);
    }
  };


  if (isLoadingData) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading company profile...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Profile & Branding"
        description="Manage your organization's logo and primary display name."
      >
        <Building2 className="h-8 w-8 text-primary" />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
          <CardDescription>
            Update your company's logo. This will be displayed in the dashboard header.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Current Logo for {companyName || 'Your Company'}:</Label>
            <div className="mt-2 w-32 h-32 p-2 border rounded-md flex items-center justify-center bg-muted/50">
              {currentLogoUrl ? (
                <Image
                  src={currentLogoUrl}
                  alt="Current company logo"
                  width={120}
                  height={120}
                  className="object-contain"
                  data-ai-hint="company logo"
                />
              ) : (
                <span className="text-xs text-muted-foreground">No logo set</span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="newLogoFile">Upload New Logo</Label>
            <Input
              id="newLogoFile-hidden"
              type="file"
              accept="image/png, image/jpeg, image/svg+xml, image/gif"
              onChange={handleFileChange}
              className="hidden"
              disabled={isSaving}
            />
            <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('newLogoFile-hidden')?.click()} 
                disabled={isSaving}
                className="w-full sm:w-auto justify-start mt-1"
            >
              <UploadCloud className="mr-2 h-4 w-4" /> {newLogoFile ? newLogoFile.name : "Choose File"}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">Or paste image URL below.</p>
            <Input 
                id="newLogoUrl"
                type="text"
                placeholder="https://example.com/new-logo.png"
                onChange={handleUrlChange}
                className="mt-1"
                disabled={isSaving}
                value={previewNewLogoUrl && !newLogoFile ? previewNewLogoUrl : ''} // Show URL if it's the source of preview
            />
          </div>

          {previewNewLogoUrl && (
            <div>
              <Label>New Logo Preview:</Label>
              <div className="mt-2 w-32 h-32 p-2 border border-primary rounded-md flex items-center justify-center bg-muted/50">
                <Image
                  src={previewNewLogoUrl}
                  alt="New logo preview"
                  width={120}
                  height={120}
                  className="object-contain"
                  data-ai-hint="company logo"
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="gap-2">
          <Button onClick={handleSaveLogo} disabled={isSaving || (!newLogoFile && !previewNewLogoUrl)}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save New Logo
          </Button>
           {currentLogoUrl && !currentLogoUrl.includes("placehold.co") && // Show clear only if a custom logo is set
             <Button variant="destructive" onClick={() => { setNewLogoFile(null); setPreviewNewLogoUrl(null); handleSaveLogo(); }} disabled={isSaving}>
                Clear Logo
            </Button>
           }
        </CardFooter>
      </Card>
      {/* Add other company profile fields here if needed, e.g., edit company name */}
    </div>
  );
}
