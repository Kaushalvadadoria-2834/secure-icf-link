import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConsent } from "@/context/ConsentContext";
import { ConsentHeader } from "@/components/layout/ConsentHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample ICF content for all 24 pages
const documentPages = Array.from({ length: 24 }, (_, i) => ({
  page: i + 1,
  title: [
    "Study Overview",
    "Study Purpose",
    "Study Procedures",
    "Visit Schedule",
    "Randomization",
    "Medications",
    "Blood Sampling",
    "Medical Assessments",
    "Risks Overview",
    "Common Side Effects",
    "Serious Risks",
    "Benefits",
    "Compensation",
    "Confidentiality",
    "Data Protection",
    "HIPAA Authorization",
    "Voluntary Participation",
    "Withdrawal Rights",
    "Contact Information",
    "Principal Investigator",
    "IRB Information",
    "Patient Rights",
    "Cost Information",
    "Signature Section"
  ][i],
  content: `This is page ${i + 1} of the informed consent document. In a real implementation, this would contain the detailed consent information. ${
    i + 1 <= 3
      ? "This section introduces the clinical trial, its goals, and what participation means for you."
      : i + 1 <= 8
      ? "This section describes the procedures, visits, and what you can expect during the study."
      : i + 1 <= 12
      ? "This section outlines the risks and benefits of participation."
      : i + 1 <= 18
      ? "This section covers data protection, your rights, and voluntary participation."
      : "This section provides contact information and concludes the consent document."
  }`,
  minimumTime: 15, // minimum seconds per page
}));

const DocumentViewer = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { toast } = useToast();
  const { patientInfo, documentState, updateDocumentState } = useConsent();

  const [currentPage, setCurrentPage] = useState(documentState.currentPage);
  const [pageStartTime, setPageStartTime] = useState(Date.now());
  const [timeOnPage, setTimeOnPage] = useState(0);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentPageData = documentPages[currentPage - 1];
  const canAdvance = hasScrolledToBottom && timeOnPage >= currentPageData.minimumTime;
  const isLastPage = currentPage === documentPages.length;

  // Timer for time on page
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOnPage((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentPage]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10;
      if (scrolledToBottom && !hasScrolledToBottom) {
        setHasScrolledToBottom(true);
      }
    };

    const ref = contentRef.current;
    ref?.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state
    return () => ref?.removeEventListener("scroll", handleScroll);
  }, [hasScrolledToBottom]);

  const handleNextPage = () => {
    if (!canAdvance) {
      const remaining = currentPageData.minimumTime - timeOnPage;
      toast({
        title: remaining > 0 ? "Please take time to read" : "Please scroll to bottom",
        description: remaining > 0
          ? `Please spend at least ${remaining} more seconds on this page.`
          : "Please scroll to the bottom of the page before continuing.",
        variant: "destructive",
      });
      return;
    }

    // Save page timing
    const pageCompleteTime = Date.now();
    const duration = Math.floor((pageCompleteTime - pageStartTime) / 1000);
    
    updateDocumentState({
      pagesRead: [...new Set([...documentState.pagesRead, currentPage])],
      pageTimings: [
        ...documentState.pageTimings,
        {
          page: currentPage,
          timeSpent: duration,
          scrollDepth: 100,
          timestamp: new Date().toISOString(),
        },
      ],
      totalReadingTime: documentState.totalReadingTime + duration,
    });

    if (isLastPage) {
      updateDocumentState({
        documentCompleted: true,
        completedAt: new Date(),
      });
      navigate(`/patient/consent/${token}/checklist`);
    } else {
      setCurrentPage(currentPage + 1);
      updateDocumentState({ currentPage: currentPage + 1 });
      setPageStartTime(Date.now());
      setTimeOnPage(0);
      setHasScrolledToBottom(false);
      contentRef.current?.scrollTo(0, 0);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      updateDocumentState({ currentPage: currentPage - 1 });
      setPageStartTime(Date.now());
      setTimeOnPage(0);
      setHasScrolledToBottom(false);
      contentRef.current?.scrollTo(0, 0);
    }
  };

  const progressPercentage = (documentState.pagesRead.length / documentPages.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ConsentHeader
        studyName={patientInfo.studyInfo.protocolName}
        siteName={patientInfo.studyInfo.siteName}
        patientId={patientInfo.patientId}
        currentStep={2}
        totalSteps={7}
        stepTitle="Reading Consent Document"
        timeSpent={`${Math.floor(documentState.totalReadingTime / 60)}:${(documentState.totalReadingTime % 60)
          .toString()
          .padStart(2, "0")}`}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        <main className="container mx-auto px-4 py-4 flex-1 overflow-hidden flex flex-col">
          {/* Progress Section */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Reading Progress</span>
              <span className="text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Document Content */}
          <Card className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{currentPageData.title}</h2>
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {documentPages.length}
                </p>
              </div>
              <Badge variant="secondary">
                Time on page: {timeOnPage}s
              </Badge>
            </div>

            <CardContent
              ref={contentRef}
              className="flex-1 overflow-y-auto p-6 prose prose-sm max-w-none"
            >
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  {currentPageData.title}
                </h3>
                
                <div className="text-foreground leading-relaxed space-y-4">
                  {Array.from({ length: 8 }, (_, i) => (
                    <p key={i} className="text-base">
                      {currentPageData.content} This paragraph provides additional detailed information
                      about the study procedures, requirements, and what participants can expect. All
                      information has been reviewed and approved by the Institutional Review Board (IRB)
                      to ensure participant safety and ethical standards.
                    </p>
                  ))}
                </div>

                {currentPage === 9 && (
                  <div className="bg-warning-light border-l-4 border-warning p-4 my-4">
                    <h4 className="font-semibold text-warning-foreground mb-2">Important Risk Information</h4>
                    <p className="text-sm">
                      Please pay special attention to this section about potential risks and side effects.
                    </p>
                  </div>
                )}

                {isLastPage && (
                  <div className="bg-success-light border-l-4 border-success p-4 my-4">
                    <h4 className="font-semibold text-success-foreground mb-2">✓ Document Review Complete</h4>
                    <p className="text-sm">
                      You have reached the end of the consent document. You will now proceed to the
                      comprehension checklist to confirm your understanding.
                    </p>
                  </div>
                )}

                {/* Extra content to ensure scrolling is needed */}
                <div className="h-32"></div>
              </div>
            </CardContent>
          </Card>

          {/* Page Indicators */}
          <div className="flex justify-center gap-1 py-4">
            {documentPages.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  documentState.pagesRead.includes(idx + 1)
                    ? "w-2 bg-success"
                    : idx + 1 === currentPage
                    ? "w-6 bg-primary"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4 py-4">
            <Button
              variant="outline"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              size="lg"
              className="touch-target"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={handleNextPage}
              disabled={!canAdvance}
              size="lg"
              className="touch-target relative"
            >
              {isLastPage ? (
                <>
                  Continue to Checklist
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next Page
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
              {!canAdvance && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                  {!hasScrolledToBottom
                    ? "Scroll to bottom"
                    : `Wait ${currentPageData.minimumTime - timeOnPage}s more`}
                </div>
              )}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocumentViewer;
