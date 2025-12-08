import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  return authService.checkAuthStatus().pipe(
    map(isLoggedIn => {
      if (isLoggedIn) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};
