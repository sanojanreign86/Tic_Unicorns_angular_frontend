export type LeaveStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled';

export interface Leave {
  leaveId: number;
  userId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}

export interface CreateLeaveRequest {
  userId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface UpdateLeaveRequest {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
}