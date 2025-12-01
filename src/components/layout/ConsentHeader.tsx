import { Shield, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ConsentHeaderProps {
  studyName: string;
  siteName: string;
  patientId: string;
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  timeSpent?: string;
}

export const ConsentHeader = ({
  studyName,
  siteName,
  patientId,
  currentStep,
  totalSteps,
  stepTitle,
  timeSpent,
}: ConsentHeaderProps) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <header className="sticky top-0 bg-card shadow-sm z-50 border-b border-border">
      <div className="container mx-auto px-4 py-4">
        {/* Top row: Study info and badges */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{studyName}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Site: {siteName}</span>
                <span>•</span>
                <span>Patient ID: {patientId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {timeSpent && (
              <Badge variant="secondary" className="gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {timeSpent}
              </Badge>
            )}
          </div>
        </div>

        {/* Progress section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{stepTitle}</span>
            <span className="text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>
    </header>
  );
};
