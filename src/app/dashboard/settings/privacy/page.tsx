
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileText, Download, UserX, ShieldQuestion, BookLock } from 'lucide-react';

export default function PrivacyAndCompliancePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Data Privacy &amp; Compliance"
        description="Manage data handling policies, user consent, and compliance with regulations."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText size={20} /> Data Management Policies</CardTitle>
            <CardDescription>Configure data retention, anonymization, and access control rules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-3 border rounded-md">
              <Label htmlFor="autoAnonymizeSwitch" className="flex flex-col space-y-1 cursor-pointer">
                <span>Auto-Anonymize Old Data</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Automatically anonymize recognition data older than 365 days.
                </span>
              </Label>
              <Switch id="autoAnonymizeSwitch" defaultChecked />
            </div>
             <div className="flex items-center justify-between p-3 border rounded-md">
              <Label htmlFor="strictModeSwitch" className="flex flex-col space-y-1 cursor-pointer">
                <span>Strict Compliance Mode</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Enables stricter data handling rules for specific regulations (e.g., GDPR).
                </span>
              </Label>
              <Switch id="strictModeSwitch" />
            </div>
            <Button variant="outline" className="w-full">View &amp; Edit Data Retention Policy</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserX size={20} /> User Data Requests</CardTitle>
            <CardDescription>Manage user requests for data access, export, or deletion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No pending user data requests.
            </p>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" /> Process Data Export Request (Mock)
            </Button>
            <Button variant="destructive" className="w-full">
              <UserX className="mr-2 h-4 w-4" /> Process Deletion Request (Mock)
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldQuestion size={20} /> Consent Management</CardTitle>
          <CardDescription>Configure and track user consent for data processing and cookies.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-md">
            <Label htmlFor="cookieConsentSwitch" className="flex flex-col space-y-1 cursor-pointer">
              <span>Cookie Consent Banner</span>
              <span className="text-xs font-normal text-muted-foreground">
                Display a cookie consent banner for new visitors.
              </span>
            </Label>
            <Switch id="cookieConsentSwitch" defaultChecked />
          </div>
          <Button variant="outline" className="w-full">Customize Consent Banner Text</Button>
          <Button variant="outline" className="w-full">View Consent Log</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookLock size={20} /> Compliance Documentation</CardTitle>
           <CardDescription>Access relevant compliance documents and certifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <Button variant="link" className="p-0 h-auto text-base">View GDPR Compliance Statement</Button><br/>
            <Button variant="link" className="p-0 h-auto text-base">Download SOC 2 Report (Mock)</Button><br/>
            <Button variant="link" className="p-0 h-auto text-base">Privacy Policy</Button>
        </CardContent>
      </Card>
    </div>
  );
}
