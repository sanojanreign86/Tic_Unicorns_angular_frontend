import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get<T>(
    endpoint: string,
    params?: HttpParams
  ): Observable<T> {
    return this.http.get<T>(
      `${this.baseUrl}/${endpoint}`,
      { params }
    );
  }

  post<T>(
    endpoint: string,
    body: unknown
  ): Observable<T> {
    return this.http.post<T>(
      `${this.baseUrl}/${endpoint}`,
      body
    );
  }

  put<T>(
    endpoint: string,
    body: unknown
  ): Observable<T> {
    return this.http.put<T>(
      `${this.baseUrl}/${endpoint}`,
      body
    );
  }

  patch<T>(
    endpoint: string,
    body: unknown
  ): Observable<T> {
    return this.http.patch<T>(
      `${this.baseUrl}/${endpoint}`,
      body
    );
  }

  delete<T>(
    endpoint: string
  ): Observable<T> {
    return this.http.delete<T>(
      `${this.baseUrl}/${endpoint}`
    );
  }
}