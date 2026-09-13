import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';

import {
  StudentMasterList,
  CreateStudentMasterListRequest,
  UpdateStudentMasterListRequest
} from '../models/student-master-list.model';

@Injectable({
  providedIn: 'root'
})
export class StudentMasterListService {
  private readonly api = inject(ApiService);

  getMasterStudents(): Observable<StudentMasterList[]> {
    return this.api.get<StudentMasterList[]>('StudentMasterList');
  }

  getMasterStudentById(
    masterStudentId: number
  ): Observable<StudentMasterList> {
    return this.api.get<StudentMasterList>(
      `StudentMasterList/${masterStudentId}`
    );
  }

  getMasterStudentByUniversityStudentId(
  universityStudentId: string
): Observable<StudentMasterList> {
  return this.api.get<StudentMasterList>(
    `StudentMasterList/university-student/${encodeURIComponent(universityStudentId)}`
  );
}

  createMasterStudent(
    request: CreateStudentMasterListRequest
  ): Observable<StudentMasterList> {
    return this.api.post<StudentMasterList>(
      'StudentMasterList',
      request
    );
  }

  updateMasterStudent(
    masterStudentId: number,
    request: UpdateStudentMasterListRequest
  ): Observable<StudentMasterList> {
    return this.api.put<StudentMasterList>(
      `StudentMasterList/${masterStudentId}`,
      request
    );
  }
}