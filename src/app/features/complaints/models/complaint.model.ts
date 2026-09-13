export interface Complaint {
    complaintId: number;
    categoryId: number;
    studentId: number;
    title: string;
    description: string;
    status: string;
    actionRemarks: string;
    statusChangedBy?: number | null;
    createdAt: string;
    updatedAt?: string | null;
  }
  
  export interface CreateComplaintRequest {
    categoryId: number;
    studentId: number;
    title: string;
    description: string;
  }
  
  export interface UpdateComplaintRequest {
    status: string;
    actionRemarks: string;
    statusChangedBy?: number | null;
  }