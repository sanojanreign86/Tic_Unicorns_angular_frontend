export interface StudentMasterList {
  masterStudentId: number;
  universityId: number;
  facultyId: number;
  departmentId: number;
  universityStudentId: string;
  studentName: string;
  mobileNumber: string;
  isActive: boolean;
}

export interface CreateStudentMasterListRequest {
  universityId: number;
  facultyId: number;
  departmentId: number;
  universityStudentId: string;
  studentName: string;
  mobileNumber: string;
}

export interface UpdateStudentMasterListRequest {
  universityId: number;
  facultyId: number;
  departmentId: number;
  universityStudentId: string;
  studentName: string;
  mobileNumber: string;
  isActive: boolean;
}