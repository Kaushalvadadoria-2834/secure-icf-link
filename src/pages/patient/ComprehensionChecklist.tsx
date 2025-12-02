import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConsent } from "@/context/ConsentContext";
import { ConsentHeader } from "@/components/layout/ConsentHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Video, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ComprehensionChecklist = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { toast } = useToast();
  const { patientInfo, checklistState, updateChecklistItem, updateChecklistState } = useConsent();

  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const currentItem = expandedItem !== null
    ? checklistState.items.find((item) => item.id === expandedItem)
    : null;

  const handleExpandItem = (itemId: number) => {
    if (expandedItem === itemId) {
      setExpandedItem(null);
    } else {
      setExpandedItem(itemId);
      setIsPlayingAudio(false);
      setIsRecording(false);
      setRecordingTime(0);
      setPreviewVideo(null);
    }
  };

  const handlePlayAudio = (itemId: number) => {
    setIsPlayingAudio(true);
    
    // Simulate audio playback
    setTimeout(() => {
      setIsPlayingAudio(false);
      updateChecklistItem(itemId, {
        audioPlayed: true,
        audioCompletedAt: new Date(),
      });
      toast({
        title: "Audio Complete",
        description: "You can now record your video confirmation.",
      });
    }, 3000); // Simulate 3 second audio
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    const interval = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 30) {
          handleStopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    setRecordingInterval(interval);
  };

  const handleStopRecording = () => {
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
    setIsRecording(false);
    
    // Create mock video data
    const mockVideoData = `data:video/webm;base64,mock_video_data_${Date.now()}`;
    setPreviewVideo(mockVideoData);
  };

  const handleAcceptVideo = () => {
    if (!currentItem || !previewVideo) return;

    updateChecklistItem(currentItem.id, {
      videoRecorded: true,
      videoDataUrl: previewVideo,
      videoRecordedAt: new Date(),
      videoDuration: recordingTime,
      completed: true,
      completedAt: new Date(),
    });

    const newTotalCompleted = checklistState.items.filter(
      (item) => item.id === currentItem.id || item.completed
    ).length;

    updateChecklistState({
      totalCompleted: newTotalCompleted,
      checklistCompleted: newTotalCompleted === checklistState.items.length,
    });

    toast({
      title: "Item Complete",
      description: `${newTotalCompleted} of ${checklistState.items.length} items completed.`,
    });

    setExpandedItem(null);
    setPreviewVideo(null);
    setRecordingTime(0);

    // Auto-scroll to next item
    if (newTotalCompleted < checklistState.items.length) {
      setTimeout(() => {
        const nextIncompleteItem = checklistState.items.find((item) => !item.completed && item.id !== currentItem.id);
        if (nextIncompleteItem) {
          setExpandedItem(nextIncompleteItem.id);
          document.getElementById(`item-${nextIncompleteItem.id}`)?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 500);
    }
  };

  const handleRetakeVideo = () => {
    setPreviewVideo(null);
    setRecordingTime(0);
  };

  const handleContinue = () => {
    if (checklistState.checklistCompleted) {
      navigate(`/patient/consent/${token}/signature`);
    } else {
      toast({
        title: "Checklist Incomplete",
        description: `Please complete all ${checklistState.items.length - checklistState.totalCompleted} remaining items.`,
        variant: "destructive",
      });
    }
  };

  const progressPercentage = (checklistState.totalCompleted / checklistState.items.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <ConsentHeader
        studyName={patientInfo.studyInfo.protocolName}
        siteName={patientInfo.studyInfo.siteName}
        patientId={patientInfo.patientId}
        currentStep={3}
        totalSteps={5}
        stepTitle="Comprehension Checklist"
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction */}
        <div className="mb-8 animate-fade-in">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Verify Your Understanding</CardTitle>
              <CardDescription>
                For each statement below, you will need to:
                <ul className="list-decimal list-inside mt-2 space-y-1">
                  <li>Listen to the audio explanation</li>
                  <li>Record a video confirmation</li>
                  <li>Both steps must be completed to proceed</li>
                </ul>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Progress */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Checklist Progress</span>
            <span className="text-muted-foreground">
              {checklistState.totalCompleted} of {checklistState.items.length} completed
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Checklist Items */}
        <div className="space-y-4 mb-8">
          {checklistState.items.map((item, index) => {
            const isExpanded = expandedItem === item.id;
            const statusColor = item.completed
              ? "success"
              : item.audioPlayed
              ? "primary"
              : "muted";

            return (
              <Card
                key={item.id}
                id={`item-${item.id}`}
                className={`transition-all duration-200 ${
                  item.completed
                    ? "border-success"
                    : isExpanded
                    ? "border-primary shadow-lg"
                    : ""
                }`}
              >
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => !item.completed && handleExpandItem(item.id)}
                >
                  <div className="flex items-start gap-4">
                    {item.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-base">{item.statement}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={item.completed ? "default" : "secondary"}
                          className={item.completed ? "bg-success" : ""}
                        >
                          {item.completed
                            ? "✓ Completed"
                            : item.audioPlayed
                            ? "Audio Played"
                            : "Not Started"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && !item.completed && (
                  <CardContent className="space-y-6 pt-0">
                    {/* Audio Section */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Step 1: Listen to Audio Explanation</h4>
                      <div className="media-container">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              onClick={() => handlePlayAudio(item.id)}
                              disabled={isPlayingAudio}
                              size="sm"
                              variant={item.audioPlayed ? "secondary" : "default"}
                            >
                              {isPlayingAudio ? (
                                <>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Playing...
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  {item.audioPlayed ? "Replay" : "Play"}
                                </>
                              )}
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Duration: {Math.floor(item.audioDuration / 60)}:
                              {(item.audioDuration % 60).toString().padStart(2, "0")}
                            </span>
                          </div>
                          {item.audioPlayed && (
                            <Badge variant="secondary" className="bg-success text-success-foreground">
                              ✓ Complete
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Video Section */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Step 2: Record Your Confirmation</h4>
                      <div className="media-container">
                        {!item.audioPlayed ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Complete audio first to unlock video recording</p>
                          </div>
                        ) : !previewVideo ? (
                          <div className="space-y-4">
                            <div className="bg-muted/50 rounded-lg aspect-video flex items-center justify-center">
                              {isRecording ? (
                                <div className="text-center space-y-2">
                                  <div className="w-16 h-16 bg-error rounded-full flex items-center justify-center mx-auto animate-pulse">
                                    <div className="w-8 h-8 bg-white rounded-full" />
                                  </div>
                                  <p className="text-lg font-semibold">{recordingTime}s / 30s</p>
                                </div>
                              ) : (
                                <div className="text-center text-muted-foreground">
                                  <Video className="w-12 h-12 mx-auto mb-2" />
                                  <p>Camera preview will appear here</p>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-center">
                              {!isRecording ? (
                                <Button onClick={handleStartRecording} size="lg" className="touch-target">
                                  <Video className="w-4 h-4 mr-2" />
                                  Start Recording
                                </Button>
                              ) : (
                                <Button onClick={handleStopRecording} size="lg" variant="destructive" className="touch-target">
                                  Stop Recording
                                </Button>
                              )}
                            </div>

                            <p className="text-xs text-center text-muted-foreground">
                              Recording will auto-stop at 30 seconds
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-muted rounded-lg aspect-video flex items-center justify-center">
                              <p className="text-muted-foreground">Video preview ({recordingTime}s)</p>
                            </div>

                            <div className="flex gap-2 justify-center">
                              <Button onClick={handleRetakeVideo} variant="outline">
                                Re-record
                              </Button>
                              <Button onClick={handleAcceptVideo} className="touch-target">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Accept & Continue
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Completion */}
        {checklistState.checklistCompleted && (
          <Card className="bg-success-light border-success animate-fade-in mb-8">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-success">
                    🎉 Comprehension Checklist Complete!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    All {checklistState.items.length} attestations completed. You can now proceed to signature.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!checklistState.checklistCompleted}
            size="lg"
            className="w-full md:w-auto px-12 touch-target"
          >
            {checklistState.checklistCompleted ? (
              <>
                Proceed to Signature
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Complete {checklistState.items.length - checklistState.totalCompleted} more items
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ComprehensionChecklist;
