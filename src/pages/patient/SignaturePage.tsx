import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConsent } from "@/context/ConsentContext";
import { ConsentHeader } from "@/components/layout/ConsentHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PenTool, RotateCcw, Eraser, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SignaturePage = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { toast } = useToast();
  const { patientInfo, documentState, checklistState, signatureState, updateSignatureState } = useConsent();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [consentChecked, setConsentChecked] = useState(signatureState.consentAccepted);
  const [termsChecked, setTermsChecked] = useState(signatureState.termsAccepted);
  const [penColor, setPenColor] = useState("#000000");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Set drawing style
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [penColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmit = async () => {
    if (!hasSignature) {
      toast({
        title: "Signature Required",
        description: "Please sign in the box above before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!consentChecked || !termsChecked) {
      toast({
        title: "Agreements Required",
        description: "Please check all required boxes before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Convert canvas to data URL
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureDataUrl = canvas.toDataURL("image/png");

    updateSignatureState({
      signatureDataUrl,
      signatureTimestamp: new Date(),
      termsAccepted: termsChecked,
      consentAccepted: consentChecked,
      submitted: true,
      submittedAt: new Date(),
    });

    // Simulate submission delay
    setTimeout(() => {
      navigate(`/patient/consent/${token}/complete`);
    }, 2000);
  };

  const canSubmit = hasSignature && consentChecked && termsChecked;

  const totalReadingTime = Math.floor(documentState.totalReadingTime / 60);

  return (
    <div className="min-h-screen bg-background">
      <ConsentHeader
        studyName={patientInfo.studyInfo.protocolName}
        siteName={patientInfo.studyInfo.siteName}
        patientId={patientInfo.patientId}
        currentStep={4}
        totalSteps={7}
        stepTitle="Digital Signature"
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Journey Summary */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle>Review Your Consent Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <div className="flex-1">
                  <p className="font-medium">Identity Verified</p>
                  <p className="text-sm text-muted-foreground">{patientInfo.email}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <div className="flex-1">
                  <p className="font-medium">Document Read</p>
                  <p className="text-sm text-muted-foreground">
                    {documentState.totalPages} pages, {totalReadingTime} minutes
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <div className="flex-1">
                  <p className="font-medium">Comprehension Verified</p>
                  <p className="text-sm text-muted-foreground">
                    {checklistState.totalCompleted} attestations completed
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consent Statement */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle>I hereby consent to participate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground">I confirm that:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>I have read and understood the informed consent document</li>
                <li>I have completed all comprehension attestations</li>
                <li>I voluntarily agree to participate in this clinical trial</li>
                <li>I understand I can withdraw at any time without penalty</li>
                <li>I authorize the use of my personal and health data as described</li>
              </ul>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Checkbox
                id="consent"
                checked={consentChecked}
                onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
              />
              <Label htmlFor="consent" className="cursor-pointer font-normal">
                I agree to all the above statements
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Signature Canvas */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="w-5 h-5" />
              Your Signature Required
            </CardTitle>
            <CardDescription>
              Sign below with your finger or mouse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Signature Canvas</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSignature}
                    disabled={!hasSignature}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>

              <canvas
                ref={canvasRef}
                className="signature-canvas w-full h-48 md:h-64 touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />

              {!hasSignature && (
                <p className="text-sm text-muted-foreground text-center">
                  Sign here with your finger or mouse
                </p>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Signature of:</span>
                <span className="font-medium">{patientInfo.patientName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="font-medium">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Patient ID:</span>
                <span className="font-medium">{patientInfo.patientId}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms Checkbox */}
        <Card className="mb-8 animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={termsChecked}
                onCheckedChange={(checked) => setTermsChecked(checked as boolean)}
              />
              <Label htmlFor="terms" className="cursor-pointer font-normal">
                I certify that this is my legal signature and I am signing this consent voluntarily
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={clearSignature}
            disabled={!hasSignature || isSubmitting}
            size="lg"
          >
            <Eraser className="w-4 h-4 mr-2" />
            Clear & Redo
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            size="lg"
            className="px-8 touch-target"
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner w-4 h-4 mr-2" />
                Processing...
              </>
            ) : (
              <>
                Submit Signature
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SignaturePage;
