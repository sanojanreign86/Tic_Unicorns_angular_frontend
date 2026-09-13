import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { StudentService } from '../../services/student.service';
import {
  Student,
  UpdateStudentRequest
} from '../../models/student.model';

@Component({
  selector: 'app-student-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './student-details.html',
  styleUrl: './student-details.css'
})
export class StudentDetails implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly studentService = inject(StudentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected student: Student | null = null;

  protected isLoading = false;
  protected isSaving = false;
  protected isEditMode = false;

  protected errorMessage = '';
  protected successMessage = '';

  protected readonly studentForm = this.fb.nonNullable.group({
    firstName: [
      '',
      [Validators.required]
    ],
    lastName: [
      '',
      [Validators.required]
    ],
    dateOfBirth: [''],
    gender: [''],
    email: [
      '',
      [Validators.email]
    ],
    phoneNumber: [''],
    isActive: [true]
  });

  private studentId = 0;

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!id || id <= 0) {
      this.errorMessage = 'Invalid student ID.';
      return;
    }

    this.studentId = id;
    this.loadStudent();
  }

  protected loadStudent(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentService
      .getStudentById(this.studentId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe({
        next: (student) => {
          this.student = student;

          this.studentForm.patchValue({
            firstName: student.firstName,
            lastName: student.lastName,
            dateOfBirth: student.dateOfBirth
              ? student.dateOfBirth.substring(0, 10)
              : '',
            gender: student.gender || '',
            email: student.email || '',
            phoneNumber: student.phoneNumber || '',
            isActive: student.isActive
          });
        },

        error: (error) => {
          this.errorMessage =
            error?.error?.message ||
            'Unable to load student details.';
        }
      });
  }

  protected enableEdit(): void {
    this.clearMessages();
    this.isEditMode = true;
  }

  protected cancelEdit(): void {
    this.clearMessages();

    if (this.student) {
      this.studentForm.patchValue({
        firstName: this.student.firstName,
        lastName: this.student.lastName,
        dateOfBirth: this.student.dateOfBirth
          ? this.student.dateOfBirth.substring(0, 10)
          : '',
        gender: this.student.gender || '',
        email: this.student.email || '',
        phoneNumber: this.student.phoneNumber || '',
        isActive: this.student.isActive
      });
    }

    this.isEditMode = false;
  }

  protected saveStudent(): void {
    this.clearMessages();

    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const request: UpdateStudentRequest =
      this.studentForm.getRawValue();

    this.isSaving = true;

    this.studentService
      .updateStudent(this.studentId, request)
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe({
        next: (updatedStudent) => {
          this.student = updatedStudent;
          this.isEditMode = false;

          this.successMessage =
            'Student details updated successfully.';
        },

        error: (error) => {
          this.errorMessage =
            error?.error?.message ||
            'Unable to update student details.';
        }
      });
  }

  protected goBack(): void {
    this.router.navigate(['/students']);
  }

  protected clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}