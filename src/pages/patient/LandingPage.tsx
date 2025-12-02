import { useNavigate, useParams } from "react-router-dom";
import { useConsent } from "@/context/ConsentContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustBadges } from "@/components/layout/TrustBadges";
import { Shield, FileText, Calendar } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { patientInfo } = useConsent();

  const handleBeginVerification = () => {
    navigate(`/patient/consent/${token}/verify`);
  };

  // Mock expiry date (30 days from now)
  const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {patientInfo.studyInfo.protocolName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{patientInfo.studyInfo.siteCode}</Badge>
                <span className="text-sm text-muted-foreground">
                  Site: {patientInfo.studyInfo.siteName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Welcome to Electronic Informed Consent
            </h2>
            <p className="text-xl text-muted-foreground">
              Please verify your identity to view and sign the consent document
            </p>
          </div>

          {/* Patient Info Card */}
          <Card className="medical-card animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Your Consent Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-medium text-foreground">
                    {patientInfo.patientId.replace(/\d(?=\d{3})/g, "*")}***
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Protocol ID</p>
                  <p className="font-medium text-foreground">
                    {patientInfo.studyInfo.protocolId}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Language</p>
                  <p className="font-medium text-foreground">{patientInfo.language}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Document Version</p>
                  <p className="font-medium text-foreground">
                    {patientInfo.studyInfo.version}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Valid until {expiryDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Badges */}
          <div className="animate-fade-in">
            <TrustBadges expiryDate={expiryDate} />
          </div>

          {/* CTA Button */}
          <div className="flex justify-center animate-fade-in">
            <Button
              onClick={handleBeginVerification}
              size="lg"
              className="w-full md:w-auto px-8 py-6 text-lg touch-target"
            >
              Begin Verification
            </Button>
          </div>

          {/* What to Expect */}
          <Card className="medical-card animate-fade-in">
            <CardHeader>
              <CardTitle>What to Expect</CardTitle>
              <CardDescription>
                The consent process will guide you through the following steps:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { step: 1, title: "Identity Verification", desc: "Verify your email address" },
                  { step: 2, title: "Document Review", desc: "Read the informed consent document" },
                  { step: 3, title: "Comprehension Check", desc: "Confirm your understanding with audio and video" },
                  { step: 4, title: "Digital Signature", desc: "Sign the consent electronically" },
                  { step: 5, title: "Completion", desc: "Download your signed consent and view next steps" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="step-indicator incomplete mt-1">{item.step}</div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="text-center text-sm text-muted-foreground animate-fade-in">
            <p>Need help? Contact the study coordinator:</p>
            <p className="font-medium text-foreground mt-1">
              {patientInfo.studyInfo.investigatorName}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
