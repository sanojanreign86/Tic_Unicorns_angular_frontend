import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AppIconComponent],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly theme = inject(ThemeService);

  isLoading = false;
  errorMessage = '';

  constructor() {
    const username = this.route.snapshot.queryParamMap.get('username');
    if (username) queueMicrotask(() => this.loginForm.controls.username.setValue(username));
  }

  loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.mustChangePassword) {
          void this.router.navigate(['/portal/account-security'], { queryParams: { initial: '1' } });
          return;
        }

        const role = (response.role ?? '').trim().toLowerCase();
        if (role === 'admin' || role === 'student') {
          void this.router.navigate(['/portal/dashboard']);
        } else {
          this.authService.logoutLocal();
          this.errorMessage = 'This account role is not supported by the portal.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Login failed. Please check your username and password.';
      }
    });
  }
}
