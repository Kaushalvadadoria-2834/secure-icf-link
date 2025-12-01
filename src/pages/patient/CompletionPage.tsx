import { useConsent } from "@/context/ConsentContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Download, Mail, FileText, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CompletionPage = () => {
  const { toast } = useToast();
  const { patientInfo, documentState, checklistState, signatureState } = useConsent();

  const referenceNumber = `ICF-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const completionDate = new Date().toLocaleString();

  const handleDownloadPDF = () => {
    toast({
      title: "Download Started",
      description: "Your signed consent document is being downloaded.",
    });
    // In real implementation, generate and download PDF
  };

  const handleEmailCopy = () => {
    toast({
      title: "Email Sent",
      description: `A copy has been sent to ${patientInfo.email}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Consent Completed Successfully!
              </h1>
              <p className="text-muted-foreground">
                {completionDate}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Success Message */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-success" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              🎉 Thank You!
            </h2>
            <p className="text-xl text-muted-foreground">
              Thank you for participating in our clinical trial
            </p>
          </div>

          {/* Reference Number */}
          <Card className="medical-card animate-fade-in bg-primary/5 border-primary">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Your Consent Reference Number</p>
                <div className="flex items-center justify-center gap-2">
                  <Badge className="text-lg px-4 py-2 bg-primary">
                    {referenceNumber}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Please save this reference number for your records
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Completion Summary */}
          <Card className="medical-card animate-fade-in">
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-medium">{patientInfo.patientId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Study</p>
                  <p className="font-medium">{patientInfo.studyInfo.protocolName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Site</p>
                  <p className="font-medium">{patientInfo.studyInfo.siteName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date Signed</p>
                  <p className="font-medium">{completionDate}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="font-medium">Journey Summary:</p>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Document Pages Read:</span>
                    <span className="font-medium">{documentState.totalPages} pages</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Reading Time:</span>
                    <span className="font-medium">
                      {Math.floor(documentState.totalReadingTime / 60)} minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Attestations Completed:</span>
                    <span className="font-medium">{checklistState.items.length} items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Video Confirmations:</span>
                    <span className="font-medium">{checklistState.items.length} recordings</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card className="medical-card animate-fade-in">
            <CardHeader>
              <CardTitle>What Happens Next</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-3 text-foreground">
                <li className="pl-2">
                  Your study coordinator will contact you within 2 business days
                </li>
                <li className="pl-2">
                  Please arrive for your first visit as scheduled
                </li>
                <li className="pl-2">
                  Bring a copy of this signed consent with you
                </li>
                <li className="pl-2">
                  Contact us if you have any questions
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid gap-4 animate-fade-in">
            <Button
              onClick={handleDownloadPDF}
              size="lg"
              className="w-full touch-target"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Signed Consent (PDF)
            </Button>

            <Button
              onClick={handleEmailCopy}
              variant="outline"
              size="lg"
              className="w-full touch-target"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Me a Copy
            </Button>
          </div>

          {/* Important Contacts */}
          <Card className="medical-card animate-fade-in">
            <CardHeader>
              <CardTitle>Important Contacts</CardTitle>
              <CardDescription>
                Contact these people if you have any questions or concerns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="w-4 h-4 text-primary" />
                  Study Coordinator
                </div>
                <div className="pl-6 space-y-1 text-sm">
                  <p className="font-medium">{patientInfo.studyInfo.investigatorName}</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    <span>coordinator@clinicaltrial.org</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-primary" />
                  Site Location
                </div>
                <div className="pl-6 space-y-1 text-sm text-muted-foreground">
                  <p>{patientInfo.studyInfo.siteName}</p>
                  <p>{patientInfo.studyInfo.siteCode}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Phone className="w-4 h-4 text-primary" />
                  IRB Contact (Questions about rights)
                </div>
                <div className="pl-6 space-y-1 text-sm text-muted-foreground">
                  <p>+1 (555) 987-6543</p>
                  <p>irb@institution.edu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="text-center text-sm text-muted-foreground animate-fade-in">
            <p>Need help? Visit our help center or contact support</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompletionPage;
