import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AppIconComponent],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  step: 1 | 2 | 3 | 4 = 1;
  isLoading = false;
  errorMessage = '';
  infoMessage = '';
  setupToken = '';
  username = '';

  identityForm = this.fb.nonNullable.group({
    universityStudentId: ['', [Validators.required, Validators.minLength(3)]],
    mobileNumber: ['', [Validators.required, Validators.minLength(7)]]
  });

  otpForm = this.fb.nonNullable.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{4,8}$/)]]
  });

  passwordForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmNewPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  sendOtp(): void {
    if (this.identityForm.invalid) { this.identityForm.markAllAsTouched(); return; }
    this.startRequest();
    this.auth.sendStudentOtp(this.identityForm.getRawValue()).pipe(finalize(() => this.stopRequest())).subscribe({
      next: (response) => { this.infoMessage = response.message || 'Verification code sent.'; this.step = 2; },
      error: (error) => this.errorMessage = this.readError(error, 'Unable to send the verification code. Check your student number and mobile number.')
    });
  }

  verifyOtp(): void {
    if (this.otpForm.invalid) { this.otpForm.markAllAsTouched(); return; }
    this.startRequest();
    this.auth.verifyStudentOtp({ ...this.identityForm.getRawValue(), otp: this.otpForm.getRawValue().otp })
      .pipe(finalize(() => this.stopRequest()))
      .subscribe({
        next: (response) => {
          this.setupToken = response.setupToken;
          this.username = response.username;
          this.infoMessage = 'Mobile verified. Create your permanent password to continue.';
          this.step = 3;
        },
        error: (error) => this.errorMessage = this.readError(error, 'The verification code could not be confirmed.')
      });
  }

  createPassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    const value = this.passwordForm.getRawValue();
    if (value.newPassword !== value.confirmNewPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    if (!this.setupToken || !this.username) {
      this.errorMessage = 'Your account setup session has expired. Verify your mobile number again.';
      this.step = 2;
      return;
    }

    this.startRequest();
    this.auth.setInitialPassword(this.setupToken, value.newPassword, value.confirmNewPassword).pipe(
      switchMap(() => this.auth.login({ username: this.username, password: value.newPassword })),
      finalize(() => this.stopRequest())
    ).subscribe({
      next: () => void this.router.navigate(['/portal/dashboard']),
      error: (error) => {
        // The password may already have been saved even if the automatic sign-in fails.
        this.step = 4;
        this.infoMessage = 'Your password is ready. Sign in to continue.';
        this.errorMessage = this.readError(error, 'Automatic sign-in was not completed. Your account is ready, so you can sign in now.');
      }
    });
  }

  resendOtp(): void { this.sendOtp(); }
  backToIdentity(): void { this.step = 1; this.errorMessage = ''; this.infoMessage = ''; }
  goToLogin(): void { void this.router.navigate(['/login'], { queryParams: { username: this.username || undefined } }); }

  private startRequest(): void { this.isLoading = true; this.errorMessage = ''; }
  private stopRequest(): void { this.isLoading = false; this.cdr.markForCheck(); }
  private readError(error: any, fallback: string): string {
    return error?.error?.message ?? (typeof error?.error === 'string' ? error.error : fallback);
  }
}
