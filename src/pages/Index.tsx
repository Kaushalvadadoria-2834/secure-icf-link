import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to demo consent flow
    navigate("/patient/consent/demo-token-12345");
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="loading-spinner w-12 h-12 mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">Loading consent portal...</p>
      </div>
    </div>
  );
};

export default Index;
