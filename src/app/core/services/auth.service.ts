import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly api = inject(ApiService);
  private readonly storage = inject(StorageService);

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.api
      .post<LoginResponse>('Auth/login', request)
      .pipe(
        tap((response) => {
          this.storage.setAccessToken(response.accessToken);
          this.storage.setRefreshToken(response.refreshToken);
        })
      );
  }

  getAccessToken(): string | null {
    return this.storage.getAccessToken();
  }

  isAuthenticated(): boolean {
    return !!this.storage.getAccessToken();
  }

  logoutLocal(): void {
    this.storage.removeAuthData();
  }
}