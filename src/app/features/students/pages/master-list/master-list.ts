import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { StudentMasterList } from '../../models/student-master-list.model';
import { StudentMasterListService } from '../../services/student-master-list.service';

@Component({
  selector: 'app-master-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './master-list.html',
  styleUrl: './master-list.css'
})
export class MasterList implements OnInit {
  private readonly masterStudentService =
    inject(StudentMasterListService);

  private readonly router = inject(Router);

  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);

  protected masterStudents: StudentMasterList[] = [];
  protected filteredMasterStudents: StudentMasterList[] = [];

  protected searchTerm = '';
  protected statusFilter: 'all' | 'active' | 'inactive' = 'all';

  protected isLoading = false;
  protected errorMessage = '';

  ngOnInit(): void {
    this.loadMasterStudents();
  }

  protected loadMasterStudents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.masterStudentService
      .getMasterStudents()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe({
        next: (students) => {
          this.masterStudents = students;
          this.applyFilters();
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.message ||
            'Unable to load master students. Please try again.';
        }
      });
  }

  protected applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredMasterStudents =
      this.masterStudents.filter((student) => {
        const matchesSearch =
          !search ||
          student.masterStudentId
            .toString()
            .includes(search) ||
          student.universityStudentId
            .toLowerCase()
            .includes(search) ||
          student.studentName
            .toLowerCase()
            .includes(search) ||
          student.mobileNumber
            .toLowerCase()
            .includes(search);

        const matchesStatus =
          this.statusFilter === 'all' ||
          (this.statusFilter === 'active' &&
            student.isActive) ||
          (this.statusFilter === 'inactive' &&
            !student.isActive);

        return matchesSearch && matchesStatus;
      });
  }

  protected createMasterStudent(): void {
    this.router.navigate([
      '/students/master-list/create'
    ]);
  }

  protected editMasterStudent(
    masterStudentId: number
  ): void {
    this.router.navigate([
      '/students/master-list',
      masterStudentId,
      'edit'
    ]);
  }

  protected retry(): void {
    this.loadMasterStudents();
  }
}