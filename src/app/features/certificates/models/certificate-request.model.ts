export interface Certificate {
    certificateId: number;
    studentId: number;
    certificateType: string;
    purpose: string;
    status: string;
    requestedAt: string;
    processedAt?: string | null;
    rejectionReason?: string | null;
    documentPath?: string | null;
  }
  
  export interface CreateCertificateRequest {
    studentId: number;
    certificateType: string;
    purpose: string;
  }
  
  export interface UpdateCertificateRequest {
    certificateType: string;
    purpose: string;
  }
  
  export interface UpdateCertificateStatusRequest {
    status: string;
    rejectionReason?: string | null;
  }