import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { StudentService } from '../../services/student.service';
import { CreateStudentRequest } from '../../models/student.model';

@Component({
  selector: 'app-student-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './student-create.html',
  styleUrl: './student-create.css'
})
export class StudentCreate {
  private readonly fb = inject(FormBuilder);
  private readonly studentService = inject(StudentService);
  private readonly router = inject(Router);

  protected isSaving = false;
  protected errorMessage = '';
  protected successMessage = '';

  protected readonly studentForm = this.fb.nonNullable.group({
   masterStudentId: [
  null,
  [
    Validators.required,
    Validators.min(1)
  ]
],
    firstName: [
      '',
      [
        Validators.required
      ]
    ],
    lastName: [
      '',
      [
        Validators.required
      ]
    ],
    dateOfBirth: [
      ''
    ],
    gender: [
      ''
    ],
    email: [
      '',
      [
        Validators.email
      ]
    ],
    phoneNumber: [
      ''
    ]
  });

  protected saveStudent(): void {
    this.clearMessages();

    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const formValue = this.studentForm.getRawValue();

const masterStudentId = formValue.masterStudentId;

if (masterStudentId === null) {
  this.studentForm.controls.masterStudentId.markAsTouched();
  return;
}

const request: CreateStudentRequest = {
  masterStudentId,
  firstName: formValue.firstName.trim(),
  lastName: formValue.lastName.trim(),
  dateOfBirth: formValue.dateOfBirth || null,
  gender: formValue.gender || null,
  email: formValue.email.trim() || null,
  phoneNumber: formValue.phoneNumber.trim() || null
};

    this.isSaving = true;

    this.studentService.createStudent(request).subscribe({
      next: (student) => {
        this.isSaving = false;

        this.successMessage =
          'Student created successfully.';

        setTimeout(() => {
          this.router.navigate([
            '/students',
            student.studentId
          ]);
        }, 1000);
      },

      error: (error) => {
        this.isSaving = false;

        this.errorMessage =
          error?.error?.message ||
          'Unable to create student. Please try again.';
      }
    });
  }

  protected cancel(): void {
    this.router.navigate(['/students']);
  }

  protected clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}