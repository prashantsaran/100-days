import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const loginGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isLoggedIn = !!sessionStorage.getItem('isUserLoggedIn');

  if (isLoggedIn) {
    router.navigate(['/home']); // 👈 stay away from login
    return false;
  }

  return true; // allow login page
};
