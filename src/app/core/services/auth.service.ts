import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiService, API_BASE_URL } from './api.service';
import { StorageService } from './storage.service';
import { CurrentUser, LoginRequest, LoginResponse } from '../models/auth.model';

export interface PasswordSetupResponse {
  setupToken: string;
  expiresAt: string;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(StorageService);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('Auth/login', request).pipe(
      tap((response) => {
        this.storage.setAccessToken(response.accessToken);
        this.storage.setRefreshToken(response.refreshToken);
        const role = (response.role ?? '').trim();
        this.storage.setUser<CurrentUser>({
          userId: response.userId,
          username: response.username,
          role
        });
      })
    );
  }

  sendStudentOtp(request: { universityStudentId: string; mobileNumber: string }): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('StudentRegistration/send-otp', request);
  }

  verifyStudentOtp(request: { universityStudentId: string; mobileNumber: string; otp: string }): Observable<PasswordSetupResponse> {
    return this.api.post<PasswordSetupResponse>('StudentRegistration/verify-otp', request);
  }

  setInitialPassword(setupToken: string, newPassword: string, confirmNewPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/Auth/set-initial-password`,
      { newPassword, confirmNewPassword },
      { headers: new HttpHeaders({ Authorization: `Bearer ${setupToken}` }) }
    );
  }

  forgotPassword(request: { username: string }): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('Auth/forgot-password', request);
  }

  getAccessToken(): string | null { return this.storage.getAccessToken(); }
  getCurrentUser(): CurrentUser | null { return this.storage.getUser<CurrentUser>(); }
  getRole(): string { return (this.getCurrentUser()?.role ?? '').trim(); }
  isAdmin(): boolean { return this.getRole().toLowerCase() === 'admin'; }
  isStudent(): boolean { return this.getRole().toLowerCase() === 'student'; }
  isAuthenticated(): boolean { return !!this.storage.getAccessToken(); }
  logoutLocal(): void { this.storage.removeAuthData(); }
}
