import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';

import {
  Student,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentRegistrationRequest,
  VerifyOtpRequest,
  PasswordSetupResponse,
  SetInitialPasswordRequest
} from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly api = inject(ApiService);

  // Student Management

  getStudents(): Observable<Student[]> {
    return this.api.get<Student[]>('Student');
  }

  getStudentById(studentId: number): Observable<Student> {
    return this.api.get<Student>(
      `Student/${studentId}`
    );
  }

  createStudent(
    request: CreateStudentRequest
  ): Observable<Student> {
    return this.api.post<Student>(
      'Student',
      request
    );
  }

  updateStudent(
    studentId: number,
    request: UpdateStudentRequest
  ): Observable<Student> {
    return this.api.put<Student>(
      `Student/${studentId}`,
      request
    );
  }

  // Student Registration

  sendRegistrationOtp(
    request: StudentRegistrationRequest
  ): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(
      'StudentRegistration/send-otp',
      request
    );
  }

  verifyRegistrationOtp(
    request: VerifyOtpRequest
  ): Observable<PasswordSetupResponse> {
    return this.api.post<PasswordSetupResponse>(
      'StudentRegistration/verify-otp',
      request
    );
  }

  // Initial Password Setup

  setInitialPassword(
    request: SetInitialPasswordRequest
  ): Observable<void> {
    return this.api.post<void>(
      'Auth/set-initial-password',
      request
    );
  }
}