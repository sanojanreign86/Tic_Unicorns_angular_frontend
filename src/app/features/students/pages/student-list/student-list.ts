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

import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './student-list.html',
  styleUrl: './student-list.css'
})
export class StudentList implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly router = inject(Router);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected students: Student[] = [];
  protected filteredStudents: Student[] = [];

  protected searchTerm = '';
  protected statusFilter: 'all' | 'active' | 'inactive' = 'all';

  protected isLoading = false;
  protected errorMessage = '';

  ngOnInit(): void {
    this.loadStudents();
  }

  protected loadStudents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentService
      .getStudents()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe({
        next: (students) => {
          this.students = students;
          this.applyFilters();
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.message ||
            'Unable to load students. Please try again.';
        }
      });
  }

  protected applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredStudents = this.students.filter((student) => {
      const matchesSearch =
        !search ||
        student.studentId.toString().includes(search) ||
        student.firstName.toLowerCase().includes(search) ||
        student.lastName.toLowerCase().includes(search) ||
        (student.email?.toLowerCase().includes(search) ?? false) ||
        (student.phoneNumber?.toLowerCase().includes(search) ?? false);

      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && student.isActive) ||
        (this.statusFilter === 'inactive' && !student.isActive);

      return matchesSearch && matchesStatus;
    });
  }

  protected createStudent(): void {
    this.router.navigate(['/students/create']);
  }

  protected viewStudent(studentId: number): void {
    this.router.navigate(['/students', studentId]);
  }

  protected retry(): void {
    this.loadStudents();
  }
}