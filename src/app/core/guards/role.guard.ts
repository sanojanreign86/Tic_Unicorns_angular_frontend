import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowed = (route.data?.['roles'] as string[] | undefined) ?? [];
  if (!allowed.length || allowed.some((role) => role.toLowerCase() === auth.getRole().toLowerCase())) {
    return true;
  }
  return router.createUrlTree(['/portal/dashboard']);
};
