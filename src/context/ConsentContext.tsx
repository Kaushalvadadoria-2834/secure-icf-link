import React, { createContext, useContext, useState, ReactNode } from "react";

interface PatientInfo {
  patientId: string;
  patientName: string;
  email: string;
  language: string;
  studyInfo: {
    protocolId: string;
    protocolName: string;
    version: string;
    siteCode: string;
    siteName: string;
    investigatorName: string;
  };
}

interface AuthState {
  email: string;
  emailSent: boolean;
  otpValue: string;
  otpVerified: boolean;
  otpAttempts: number;
  otpExpiry: Date | null;
  otpSentAt: Date | null;
}

interface PageTiming {
  page: number;
  timeSpent: number;
  scrollDepth: number;
  timestamp: string;
}

interface DocumentState {
  currentPage: number;
  totalPages: number;
  pagesRead: number[];
  pageTimings: PageTiming[];
  totalReadingTime: number;
  documentCompleted: boolean;
  completedAt: Date | null;
}

interface ChecklistItem {
  id: number;
  statement: string;
  audioUrl: string;
  audioDuration: number;
  audioPlayed: boolean;
  audioCompletedAt: Date | null;
  videoRecorded: boolean;
  videoDataUrl: string;
  videoRecordedAt: Date | null;
  videoDuration: number;
  completed: boolean;
  completedAt: Date | null;
}

interface ChecklistState {
  items: ChecklistItem[];
  currentItemIndex: number;
  totalCompleted: number;
  checklistCompleted: boolean;
  totalChecklistTime: number;
}

interface SignatureState {
  signatureDataUrl: string;
  signatureName: string;
  signatureTimestamp: Date | null;
  termsAccepted: boolean;
  consentAccepted: boolean;
  submitted: boolean;
  submittedAt: Date | null;
}

interface AuditStep {
  step: string;
  startedAt: string;
  completedAt: string;
  duration: number;
}

interface AuditTrail {
  linkOpened: string;
  steps: AuditStep[];
  totalDuration: number;
  completedAt: Date | null;
  ipAddress: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
  };
}

interface ConsentContextType {
  sessionToken: string;
  patientInfo: PatientInfo;
  authState: AuthState;
  documentState: DocumentState;
  checklistState: ChecklistState;
  signatureState: SignatureState;
  auditTrail: AuditTrail;
  updateAuthState: (updates: Partial<AuthState>) => void;
  updateDocumentState: (updates: Partial<DocumentState>) => void;
  updateChecklistState: (updates: Partial<ChecklistState>) => void;
  updateChecklistItem: (itemId: number, updates: Partial<ChecklistItem>) => void;
  updateSignatureState: (updates: Partial<SignatureState>) => void;
  addAuditStep: (step: Partial<AuditStep>) => void;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

const initialPatientInfo: PatientInfo = {
  patientId: "SITE-001-123",
  patientName: "John Doe",
  email: "john.doe@example.com",
  language: "English",
  studyInfo: {
    protocolId: "CARDIO-2024-01",
    protocolName: "Cardiovascular Health Study",
    version: "v2.0",
    siteCode: "USA-NYC-001",
    siteName: "Apollo Hospital Delhi",
    investigatorName: "Dr. Sarah Johnson",
  },
};

const initialChecklistItems: ChecklistItem[] = [
  {
    id: 1,
    statement: "I understand the purpose of this study",
    audioUrl: "/audio/item1.mp3",
    audioDuration: 105,
    audioPlayed: false,
    audioCompletedAt: null,
    videoRecorded: false,
    videoDataUrl: "",
    videoRecordedAt: null,
    videoDuration: 0,
    completed: false,
    completedAt: null,
  },
  {
    id: 2,
    statement: "I understand the study procedures and what will be expected of me",
    audioUrl: "/audio/item2.mp3",
    audioDuration: 120,
    audioPlayed: false,
    audioCompletedAt: null,
    videoRecorded: false,
    videoDataUrl: "",
    videoRecordedAt: null,
    videoDuration: 0,
    completed: false,
    completedAt: null,
  },
  {
    id: 3,
    statement: "I understand the potential risks and benefits of participating",
    audioUrl: "/audio/item3.mp3",
    audioDuration: 135,
    audioPlayed: false,
    audioCompletedAt: null,
    videoRecorded: false,
    videoDataUrl: "",
    videoRecordedAt: null,
    videoDuration: 0,
    completed: false,
    completedAt: null,
  },
  {
    id: 4,
    statement: "I understand that my participation is voluntary and I can withdraw at any time",
    audioUrl: "/audio/item4.mp3",
    audioDuration: 95,
    audioPlayed: false,
    audioCompletedAt: null,
    videoRecorded: false,
    videoDataUrl: "",
    videoRecordedAt: null,
    videoDuration: 0,
    completed: false,
    completedAt: null,
  },
  {
    id: 5,
    statement: "I understand how my personal data will be used and protected",
    audioUrl: "/audio/item5.mp3",
    audioDuration: 115,
    audioPlayed: false,
    audioCompletedAt: null,
    videoRecorded: false,
    videoDataUrl: "",
    videoRecordedAt: null,
    videoDuration: 0,
    completed: false,
    completedAt: null,
  },
  {
    id: 6,
    statement: "I understand the compensation and costs involved",
    audioUrl: "/audio/item6.mp3",
    audioDuration: 90,
    audioPlayed: false,
    audioCompletedAt: null,
    videoRecorded: false,
    videoDataUrl: "",
    videoRecordedAt: null,
    videoDuration: 0,
    completed: false,
    completedAt: null,
  },
  {
    id: 7,
    statement: "I understand who to contact if I have questions or concerns",
    audioUrl: "/audio/item7.mp3",
    audioDuration: 80,
    audioPlayed: false,
    audioCompletedAt: null,
    videoRecorded: false,
    videoDataUrl: "",
    videoRecordedAt: null,
    videoDuration: 0,
    completed: false,
    completedAt: null,
  },
  {
    id: 8,
    statement: "I confirm I have had the opportunity to ask questions and receive answers",
    audioUrl: "/audio/item8.mp3",
    audioDuration: 100,
    audioPlayed: false,
    audioCompletedAt: null,
    videoRecorded: false,
    videoDataUrl: "",
    videoRecordedAt: null,
    videoDuration: 0,
    completed: false,
    completedAt: null,
  },
];

export const ConsentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionToken] = useState("demo-token-12345");
  const [patientInfo] = useState<PatientInfo>(initialPatientInfo);
  
  const [authState, setAuthState] = useState<AuthState>({
    email: "",
    emailSent: false,
    otpValue: "",
    otpVerified: false,
    otpAttempts: 0,
    otpExpiry: null,
    otpSentAt: null,
  });

  const [documentState, setDocumentState] = useState<DocumentState>({
    currentPage: 1,
    totalPages: 24,
    pagesRead: [],
    pageTimings: [],
    totalReadingTime: 0,
    documentCompleted: false,
    completedAt: null,
  });

  const [checklistState, setChecklistState] = useState<ChecklistState>({
    items: initialChecklistItems,
    currentItemIndex: 0,
    totalCompleted: 0,
    checklistCompleted: false,
    totalChecklistTime: 0,
  });

  const [signatureState, setSignatureState] = useState<SignatureState>({
    signatureDataUrl: "",
    signatureName: patientInfo.patientName,
    signatureTimestamp: null,
    termsAccepted: false,
    consentAccepted: false,
    submitted: false,
    submittedAt: null,
  });

  const [auditTrail, setAuditTrail] = useState<AuditTrail>({
    linkOpened: new Date().toISOString(),
    steps: [],
    totalDuration: 0,
    completedAt: null,
    ipAddress: "192.168.1.1",
    deviceInfo: {
      browser: navigator.userAgent.includes("Chrome") ? "Chrome" : "Other",
      os: navigator.platform,
      device: /mobile/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
    },
  });

  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState((prev) => ({ ...prev, ...updates }));
  };

  const updateDocumentState = (updates: Partial<DocumentState>) => {
    setDocumentState((prev) => ({ ...prev, ...updates }));
  };

  const updateChecklistState = (updates: Partial<ChecklistState>) => {
    setChecklistState((prev) => ({ ...prev, ...updates }));
  };

  const updateChecklistItem = (itemId: number, updates: Partial<ChecklistItem>) => {
    setChecklistState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    }));
  };

  const updateSignatureState = (updates: Partial<SignatureState>) => {
    setSignatureState((prev) => ({ ...prev, ...updates }));
  };

  const addAuditStep = (step: Partial<AuditStep>) => {
    setAuditTrail((prev) => ({
      ...prev,
      steps: [...prev.steps, step as AuditStep],
    }));
  };

  return (
    <ConsentContext.Provider
      value={{
        sessionToken,
        patientInfo,
        authState,
        documentState,
        checklistState,
        signatureState,
        auditTrail,
        updateAuthState,
        updateDocumentState,
        updateChecklistState,
        updateChecklistItem,
        updateSignatureState,
        addAuditStep,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
};

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (context === undefined) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return context;
};
