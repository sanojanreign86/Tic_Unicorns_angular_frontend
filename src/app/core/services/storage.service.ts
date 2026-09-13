import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';
  private readonly userKey = 'current_user';

  // Authentication is intentionally kept in sessionStorage.
  // This prevents an Admin tab and a Student tab from overwriting each
  // other's token/role because localStorage is shared across browser tabs.
  setAccessToken(token: string): void {
    sessionStorage.setItem(this.accessTokenKey, token);
    localStorage.removeItem(this.accessTokenKey);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.accessTokenKey);
  }

  setRefreshToken(token: string): void {
    sessionStorage.setItem(this.refreshTokenKey, token);
    localStorage.removeItem(this.refreshTokenKey);
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem(this.refreshTokenKey);
  }

  setUser<T>(user: T): void {
    sessionStorage.setItem(this.userKey, JSON.stringify(user));
    localStorage.removeItem(this.userKey);
  }

  getUser<T>(): T | null {
    const user = sessionStorage.getItem(this.userKey);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as T;
    } catch {
      return null;
    }
  }

  removeAuthData(): void {
    sessionStorage.removeItem(this.accessTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
    sessionStorage.removeItem(this.userKey);

    // Remove legacy auth keys from earlier frontend versions as well.
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  clear(): void {
    this.removeAuthData();
  }
}
