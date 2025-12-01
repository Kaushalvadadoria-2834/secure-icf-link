import { Shield, Check, Clock } from "lucide-react";

interface TrustBadgesProps {
  expiryDate?: string;
}

export const TrustBadges = ({ expiryDate }: TrustBadgesProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
      <div className="flex items-center gap-2 text-success">
        <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
          <Shield className="w-4 h-4" />
        </div>
        <span className="font-medium">Secure & Encrypted</span>
      </div>
      
      <div className="flex items-center gap-2 text-success">
        <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
          <Check className="w-4 h-4" />
        </div>
        <span className="font-medium">ICH-GCP Compliant</span>
      </div>
      
      {expiryDate && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <span className="font-medium">Valid until {expiryDate}</span>
        </div>
      )}
    </div>
  );
};
