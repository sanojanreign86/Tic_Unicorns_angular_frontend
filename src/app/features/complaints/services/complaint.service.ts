import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Complaint,
  CreateComplaintRequest,
  UpdateComplaintRequest
} from '../models/complaint.model';

import { ComplaintCategory } from '../models/complaint-category.model';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:5078/api/Complaints';

  // =========================
  // Categories
  // =========================

  getCategories(): Observable<ComplaintCategory[]> {
    return this.http.get<ComplaintCategory[]>(
      `${this.apiUrl}/categories`
    );
  }

  getCategoryById(id: number): Observable<ComplaintCategory> {
    return this.http.get<ComplaintCategory>(
      `${this.apiUrl}/categories/${id}`
    );
  }

  // =========================
  // Complaints
  // =========================

  getAllComplaints(): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(this.apiUrl);
  }

  getComplaintById(id: number): Observable<Complaint> {
    return this.http.get<Complaint>(
      `${this.apiUrl}/${id}`
    );
  }

  getMyComplaints(): Observable<Complaint[]> {
  return this.http.get<Complaint[]>(`${this.apiUrl}/my`);
}

  createComplaint(
    request: CreateComplaintRequest
  ): Observable<Complaint> {
    return this.http.post<Complaint>(
      this.apiUrl,
      request
    );
  }

  updateComplaint(
    id: number,
    request: UpdateComplaintRequest
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  // =========================
  // History
  // =========================

  
  getComplaintHistory(id: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/${id}/history`
    );
  }
}