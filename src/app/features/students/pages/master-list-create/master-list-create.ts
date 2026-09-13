import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { StudentMasterListService } from '../../services/student-master-list.service';
import { CreateStudentMasterListRequest } from '../../models/student-master-list.model';

@Component({
  selector: 'app-master-list-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './master-list-create.html',
  styleUrl: './master-list-create.css'
})
export class MasterListCreate {
  private readonly fb = inject(FormBuilder);
  private readonly masterStudentService =
    inject(StudentMasterListService);
  private readonly router = inject(Router);

  protected isSaving = false;
  protected errorMessage = '';
  protected successMessage = '';

  protected readonly masterStudentForm =
    this.fb.nonNullable.group({
      universityId: [0, [
        Validators.required,
        Validators.min(1)
      ]],

      facultyId: [0, [
        Validators.required,
        Validators.min(1)
      ]],

      departmentId: [0, [
        Validators.required,
        Validators.min(1)
      ]],

      universityStudentId: ['', [
        Validators.required
      ]],

      studentName: ['', [
        Validators.required
      ]],

      mobileNumber: ['', [
        Validators.required,
        Validators.pattern(/^\+?[0-9]{9,15}$/)
      ]]
    });

  protected saveMasterStudent(): void {
    this.clearMessages();

    if (this.masterStudentForm.invalid) {
      this.masterStudentForm.markAllAsTouched();
      return;
    }

    const formValue =
      this.masterStudentForm.getRawValue();

    const request: CreateStudentMasterListRequest = {
      universityId: formValue.universityId,
      facultyId: formValue.facultyId,
      departmentId: formValue.departmentId,
      universityStudentId:
        formValue.universityStudentId.trim(),
      studentName:
        formValue.studentName.trim(),
      mobileNumber:
        formValue.mobileNumber.trim()
    };

    this.isSaving = true;

    this.masterStudentService
      .createMasterStudent(request)
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.successMessage =
            'Master student created successfully.';

          setTimeout(() => {
            this.router.navigate([
              '/students/master-list'
            ]);
          }, 1000);
        },

        error: (error) => {
          this.isSaving = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to create master student. Please try again.';
        }
      });
  }

  protected cancel(): void {
    this.router.navigate([
      '/students/master-list'
    ]);
  }

  protected clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}