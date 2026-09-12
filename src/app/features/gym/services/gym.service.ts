import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Gym,
  CreateGymRequest,
  UpdateGymRequest
} from '../models/gym.model';

@Injectable({
  providedIn: 'root'
})
export class GymService {

  private readonly apiUrl = '/api/Gym';

  constructor(private readonly http: HttpClient) {}

  getAllGyms(): Observable<Gym[]> {
    return this.http.get<Gym[]>(this.apiUrl);
  }

  getGymById(gymId: number): Observable<Gym> {
    return this.http.get<Gym>(`${this.apiUrl}/${gymId}`);
  }

  createGym(request: CreateGymRequest): Observable<Gym> {
    return this.http.post<Gym>(this.apiUrl, request);
  }

  updateGym(
    gymId: number,
    request: UpdateGymRequest
  ): Observable<Gym> {
    return this.http.put<Gym>(
      `${this.apiUrl}/${gymId}`,
      request
    );
  }

  deleteGym(gymId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${gymId}`
    );
  }
}