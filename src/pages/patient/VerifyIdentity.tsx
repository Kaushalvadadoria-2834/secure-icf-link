import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConsent } from "@/context/ConsentContext";
import { ConsentHeader } from "@/components/layout/ConsentHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

const VerifyIdentity = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { toast } = useToast();
  const { patientInfo, authState, updateAuthState, addAuditStep } = useConsent();

  const [email, setEmail] = useState(authState.email || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(300); // 5 minutes in seconds

  // Email validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(email));
  }, [email]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // OTP expiry countdown
  useEffect(() => {
    if (authState.emailSent && otpExpiry > 0) {
      const timer = setTimeout(() => setOtpExpiry(otpExpiry - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [authState.emailSent, otpExpiry]);

  const handleSendOTP = () => {
    updateAuthState({
      email,
      emailSent: true,
      otpSentAt: new Date(),
      otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
    });
    setResendCountdown(60);
    setOtpExpiry(300);
    toast({
      title: "Verification Code Sent",
      description: `We've sent a 6-digit code to ${email}`,
    });
    addAuditStep({
      step: "email_verification",
      startedAt: new Date().toISOString(),
      completedAt: "",
      duration: 0,
    });
  };

  const handleResendOTP = () => {
    if (resendCountdown === 0) {
      handleSendOTP();
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === 6) {
      handleVerifyOTP(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOTP = (otpValue: string) => {
    // Demo: Accept any 6-digit code except "000000"
    if (otpValue === "000000") {
      const remainingAttempts = 3 - (authState.otpAttempts + 1);
      updateAuthState({
        otpAttempts: authState.otpAttempts + 1,
      });
      
      toast({
        title: "Invalid Code",
        description: `Please try again. ${remainingAttempts} attempts remaining.`,
        variant: "destructive",
      });
      
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
      return;
    }

    updateAuthState({
      otpValue,
      otpVerified: true,
    });

    toast({
      title: "Verification Successful",
      description: "Your identity has been verified.",
    });

    // Brief success animation before redirect
    setTimeout(() => {
      navigate(`/patient/consent/${token}/document`);
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <ConsentHeader
        studyName={patientInfo.studyInfo.protocolName}
        siteName={patientInfo.studyInfo.siteName}
        patientId={patientInfo.patientId}
        currentStep={1}
        totalSteps={7}
        stepTitle="Identity Verification"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(`/patient/consent/${token}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {!authState.emailSent ? (
            <Card className="medical-card animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Verify Your Identity
                </CardTitle>
                <CardDescription>
                  Enter your registered email address to receive a verification code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-base"
                  />
                  {email && !isValidEmail && (
                    <p className="text-sm text-error">Please enter a valid email address</p>
                  )}
                </div>

                <Button
                  onClick={handleSendOTP}
                  disabled={!isValidEmail}
                  className="w-full touch-target"
                  size="lg"
                >
                  Send Verification Code
                </Button>
              </CardContent>
            </Card>
          ) : authState.otpVerified ? (
            <Card className="medical-card animate-fade-in bg-success-light">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold text-success">Verification Complete!</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Redirecting to consent document...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="medical-card animate-fade-in">
              <CardHeader>
                <CardTitle>Enter Verification Code</CardTitle>
                <CardDescription>
                  <div className="space-y-1">
                    <p>✓ Code sent to {email}</p>
                    <p className="text-warning">Code expires in {formatTime(otpExpiry)}</p>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="otp-input"
                      />
                    ))}
                  </div>

                  {authState.otpAttempts > 0 && (
                    <p className="text-sm text-error text-center">
                      {3 - authState.otpAttempts} attempts remaining
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    Didn't receive the code?
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleResendOTP}
                    disabled={resendCountdown > 0}
                    className="w-full"
                  >
                    {resendCountdown > 0
                      ? `Resend available in ${resendCountdown}s`
                      : "Resend Code"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => updateAuthState({ emailSent: false, otpAttempts: 0 })}
                    className="w-full"
                  >
                    Change Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default VerifyIdentity;
