import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';
  private readonly userKey = 'current_user';

  private readonly setupTokenKey = 'password_setup_token';
  private readonly setupUsernameKey = 'password_setup_username';

  setAccessToken(token: string): void {
    localStorage.setItem(this.accessTokenKey, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  setUser<T>(user: T): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser<T>(): T | null {
    const user = localStorage.getItem(this.userKey);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as T;
    } catch {
      return null;
    }
  }

  setPasswordSetupToken(token: string): void {
    sessionStorage.setItem(this.setupTokenKey, token);
  }

  getPasswordSetupToken(): string | null {
    return sessionStorage.getItem(this.setupTokenKey);
  }

  setPasswordSetupUsername(username: string): void {
    sessionStorage.setItem(this.setupUsernameKey, username);
  }

  getPasswordSetupUsername(): string | null {
    return sessionStorage.getItem(this.setupUsernameKey);
  }

  removePasswordSetupData(): void {
    sessionStorage.removeItem(this.setupTokenKey);
    sessionStorage.removeItem(this.setupUsernameKey);
  }

  removeAuthData(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  clear(): void {
    localStorage.clear();
  }
}