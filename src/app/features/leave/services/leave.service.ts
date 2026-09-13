import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Leave,
  CreateLeaveRequest,
  UpdateLeaveRequest
} from '../models/leave.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {

  private readonly apiUrl = '/api/Leave';

  constructor(
    private readonly http: HttpClient
  ) {}

  getAllLeaves(): Observable<Leave[]> {
    return this.http.get<Leave[]>(this.apiUrl);
  }

  getLeaveById(leaveId: number): Observable<Leave> {
    return this.http.get<Leave>(
      `${this.apiUrl}/${leaveId}`
    );
  }

  createLeave(
    request: CreateLeaveRequest
  ): Observable<Leave> {
    return this.http.post<Leave>(
      this.apiUrl,
      request
    );
  }

  updateLeave(
    leaveId: number,
    request: UpdateLeaveRequest
  ): Observable<Leave> {
    return this.http.put<Leave>(
      `${this.apiUrl}/${leaveId}`,
      request
    );
  }

  deleteLeave(leaveId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${leaveId}`
    );
  }
}