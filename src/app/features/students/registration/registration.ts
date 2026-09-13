import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { StudentService } from '../services/student.service';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './registration.html',
  styleUrl: './registration.css'
})
export class RegistrationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly studentService = inject(StudentService);
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected currentStep = 1;
  protected isLoading = false;
  protected errorMessage = '';
  protected successMessage = '';

  protected readonly registrationForm = this.fb.nonNullable.group({
    universityStudentId: [
      '',
      [
        Validators.required
      ]
    ],
    mobileNumber: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\+?[0-9]{9,15}$/)
      ]
    ]
  });

  protected readonly otpForm = this.fb.nonNullable.group({
    otp: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\d{6}$/)
      ]
    ]
  });

  protected sendOtp(): void {
    this.clearMessages();

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.studentService
      .sendRegistrationOtp(this.registrationForm.getRawValue())
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.currentStep = 2;
          this.successMessage =
            response.message || 'OTP sent successfully.';
        },

        error: (error) => {
          this.errorMessage =
            error?.error?.message ||
            'Unable to send OTP. Please try again.';
        }
      });
  }

  protected verifyOtp(): void {
    this.clearMessages();

    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    const request = {
      ...this.registrationForm.getRawValue(),
      ...this.otpForm.getRawValue()
    };

    this.isLoading = true;

    this.studentService
      .verifyRegistrationOtp(request)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.storageService.setPasswordSetupToken(
            response.setupToken
          );

          this.storageService.setPasswordSetupUsername(
            response.username
          );

          this.router.navigate([
            '/students/password-setup'
          ]);
        },

        error: (error) => {
          this.errorMessage =
            error?.error?.message ||
            'Invalid OTP. Please try again.';
        }
      });
  }

  protected backToRegistration(): void {
    this.clearMessages();
    this.currentStep = 1;
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}