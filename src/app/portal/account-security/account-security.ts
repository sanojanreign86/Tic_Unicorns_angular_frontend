import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon';

@Component({
  selector: 'app-account-security',
  standalone: true,
  imports: [ReactiveFormsModule, AppIconComponent],
  templateUrl: './account-security.html',
  styleUrl: './account-security.css'
})
export class AccountSecurityComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly initialSetup = this.route.snapshot.queryParamMap.get('initial') === '1';
  isSaving = false;
  message = '';
  error = '';

  form = this.fb.nonNullable.group({
    currentPassword: [''],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmNewPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  save(): void {
    this.error = '';
    this.message = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    if (!this.initialSetup && !value.currentPassword) {
      this.error = 'Current password is required.';
      return;
    }
    if (value.newPassword !== value.confirmNewPassword) {
      this.error = 'New password and confirmation do not match.';
      return;
    }

    const endpoint = this.initialSetup ? 'Auth/set-initial-password' : 'Auth/change-password';
    const body = this.initialSetup
      ? { newPassword: value.newPassword, confirmNewPassword: value.confirmNewPassword }
      : value;

    this.isSaving = true;
    this.api.post<unknown>(endpoint, body).pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.message = this.initialSetup ? 'Password setup completed.' : 'Password changed successfully.';
        if (this.initialSetup) void this.router.navigate(['/portal/dashboard']);
      },
      error: (err) => { this.error = err?.error?.message ?? err?.error ?? 'Unable to update the password.'; }
    });
  }

  logoutEverywhere(): void {
    this.api.post<unknown>('Auth/logout-all', {}).subscribe({
      next: () => {
        this.auth.logoutLocal();
        void this.router.navigate(['/login']);
      },
      error: (err) => { this.error = err?.error?.message ?? 'Unable to sign out all sessions.'; }
    });
  }
}
