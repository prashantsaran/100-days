import { CanActivateFn } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService: AuthenticationService  =  inject(AuthenticationService); 
  if (authService.isUserLoggedIn) {
    return true; 
  } else {
    return false; // Block route activation
  }
};
