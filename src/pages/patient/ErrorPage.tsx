import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Mail } from "lucide-react";

const ErrorPage = () => {
  const { token } = useParams();
  
  // Determine error type (could be passed via state or query params)
  const errorType = "expired"; // "expired" | "invalid" | "completed" | "generic"

  const errorMessages = {
    expired: {
      title: "Link Expired",
      description: "This consent link has expired and is no longer valid.",
      action: "Request a new link from your study coordinator.",
    },
    invalid: {
      title: "Invalid Link",
      description: "This consent link is invalid or has been revoked.",
      action: "Please contact your study coordinator for assistance.",
    },
    completed: {
      title: "Already Completed",
      description: "You have already completed this consent process.",
      action: "Contact your study coordinator if you need a new copy.",
    },
    generic: {
      title: "Something Went Wrong",
      description: "An unexpected error occurred.",
      action: "Please try again or contact support.",
    },
  };

  const error = errorMessages[errorType as keyof typeof errorMessages] || errorMessages.generic;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-error" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{error.title}</h1>
          <p className="text-lg text-muted-foreground">{error.description}</p>
        </div>

        <Card className="medical-card">
          <CardHeader>
            <CardTitle>What to do next</CardTitle>
            <CardDescription>{error.action}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Study Coordinator Contact:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>coordinator@clinicaltrial.org</span>
                </div>
                <p className="pl-6">Phone: +1 (555) 123-4567</p>
              </div>
            </div>

            {errorType === "expired" && (
              <Button className="w-full" variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Request New Link
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Reference Code: {token || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
