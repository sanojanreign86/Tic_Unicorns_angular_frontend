import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { StudentMasterListService } from '../../services/student-master-list.service';
import {
  StudentMasterList,
  UpdateStudentMasterListRequest
} from '../../models/student-master-list.model';

@Component({
  selector: 'app-master-list-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './master-list-edit.html',
  styleUrl: './master-list-edit.css'
})
export class MasterListEdit implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly masterStudentService =
    inject(StudentMasterListService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);

  protected masterStudentId = 0;
  protected isLoading = false;
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
      ]],

      isActive: [true]
    });

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!id || id <= 0) {
      this.errorMessage =
        'Invalid master student ID.';
      return;
    }

    this.masterStudentId = id;
    this.loadMasterStudent();
  }

  protected loadMasterStudent(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.masterStudentService
      .getMasterStudentById(this.masterStudentId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe({
        next: (student: StudentMasterList) => {
          this.masterStudentForm.patchValue({
            universityId: student.universityId,
            facultyId: student.facultyId,
            departmentId: student.departmentId,
            universityStudentId:
              student.universityStudentId,
            studentName: student.studentName,
            mobileNumber: student.mobileNumber,
            isActive: student.isActive
          });
        },

        error: (error) => {
          this.errorMessage =
            error?.error?.message ||
            'Unable to load master student. Please try again.';
        }
      });
  }

  protected updateMasterStudent(): void {
    this.clearMessages();

    if (this.masterStudentForm.invalid) {
      this.masterStudentForm.markAllAsTouched();
      return;
    }

    const formValue =
      this.masterStudentForm.getRawValue();

    const request: UpdateStudentMasterListRequest = {
      universityId: formValue.universityId,
      facultyId: formValue.facultyId,
      departmentId: formValue.departmentId,
      universityStudentId:
        formValue.universityStudentId.trim(),
      studentName:
        formValue.studentName.trim(),
      mobileNumber:
        formValue.mobileNumber.trim(),
      isActive: formValue.isActive
    };

    this.isSaving = true;

    this.masterStudentService
      .updateMasterStudent(
        this.masterStudentId,
        request
      )
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.successMessage =
            'Master student updated successfully.';

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
            'Unable to update master student. Please try again.';
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