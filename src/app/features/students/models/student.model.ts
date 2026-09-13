export interface Student {
  studentId: number;
  masterStudentId: number;
  userId: number | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: string | null;
  email: string | null;
  phoneNumber: string | null;
  admissionDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateStudentRequest {
  masterStudentId: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
}

export interface UpdateStudentRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  isActive: boolean;
}

export interface StudentRegistrationRequest {
  universityStudentId: string;
  mobileNumber: string;
}

export interface VerifyOtpRequest {
  universityStudentId: string;
  mobileNumber: string;
  otp: string;
}

export interface PasswordSetupResponse {
  setupToken: string;
  expiresAt: string;
  username: string;
}

export interface SetInitialPasswordRequest {
  setupToken: string;
  newPassword: string;
  confirmNewPassword: string;
}