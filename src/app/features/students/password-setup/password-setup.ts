import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { StudentService } from '../services/student.service';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-password-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './password-setup.html',
  styleUrl: './password-setup.css'
})
export class PasswordSetupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly studentService = inject(StudentService);
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);

  protected isLoading = false;
  protected errorMessage = '';
  protected successMessage = '';

  protected username = '';

  private setupToken: string | null = null;

  protected readonly passwordForm = this.fb.nonNullable.group({
    newPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(8)
      ]
    ],
    confirmNewPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(8)
      ]
    ]
  });

  constructor() {
    this.setupToken =
      this.storageService.getPasswordSetupToken();

    this.username =
      this.storageService.getPasswordSetupUsername() || '';
  }

  protected setPassword(): void {
    this.clearMessages();

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const {
      newPassword,
      confirmNewPassword
    } = this.passwordForm.getRawValue();

    if (newPassword !== confirmNewPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (!this.setupToken) {
      this.errorMessage =
        'Password setup session is invalid or expired.';
      return;
    }

    this.isLoading = true;

    this.studentService
      .setInitialPassword({
        setupToken: this.setupToken,
        newPassword,
        confirmNewPassword
      })
      .subscribe({
        next: () => {
          this.isLoading = false;

          this.successMessage =
            'Password created successfully. You can now login.';

          this.passwordForm.reset();

          this.storageService.removePasswordSetupData();

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to set password. Please try again.';
        }
      });
  }

  protected clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}