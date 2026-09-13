import { Injectable, inject } from '@angular/core';
import { Observable, of, shareReplay, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface CurrentStudentProfile {
  studentId: number;
  masterStudentId?: number;
  userId?: number | null;
  universityStudentId?: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  admissionDate?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class StudentProfileService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private cached$?: Observable<CurrentStudentProfile>;
  private cachedUserId?: number;

  current(): Observable<CurrentStudentProfile> {
    const currentUserId = this.auth.getCurrentUser()?.userId;

    if (!this.cached$ || this.cachedUserId !== currentUserId) {
      this.cachedUserId = currentUserId;
      this.cached$ = this.api
        .get<CurrentStudentProfile>('Student/my')
        .pipe(shareReplay(1));
    }

    return this.cached$;
  }

  updateCurrent(
    profile: CurrentStudentProfile,
    changes: Partial<CurrentStudentProfile>
  ): Observable<CurrentStudentProfile> {
    // Hostel eligibility is a one-field setup step. Use the dedicated
    // backend endpoint so empty legacy FirstName/LastName fields do not
    // block this save.
    const changedKeys = Object.keys(changes).filter(
      key => changes[key as keyof CurrentStudentProfile] !== undefined
    );

    if (changedKeys.length === 1 && changedKeys[0] === 'gender') {
      return this.api
        .patch<CurrentStudentProfile>('Student/my/hostel-eligibility', {
          gender: changes.gender
        })
        .pipe(tap(updated => this.cache(updated)));
    }

    const body = {
      firstName: changes.firstName ?? profile.firstName,
      lastName: changes.lastName ?? profile.lastName,
      dateOfBirth: changes.dateOfBirth ?? profile.dateOfBirth ?? null,
      gender: changes.gender ?? profile.gender ?? null,
      email: changes.email ?? profile.email ?? null,
      phoneNumber: changes.phoneNumber ?? profile.phoneNumber ?? null,
      isActive: changes.isActive ?? profile.isActive ?? true
    };

    return this.api
      .put<CurrentStudentProfile>('Student/my', body)
      .pipe(tap(updated => this.cache(updated)));
  }

  clear(): void {
    this.cached$ = undefined;
    this.cachedUserId = undefined;
  }

  private cache(updated: CurrentStudentProfile): void {
    this.cachedUserId = this.auth.getCurrentUser()?.userId;
    this.cached$ = of(updated).pipe(shareReplay(1));
  }
}
