import { Routes } from '@angular/router';
import { HomeComponent } from './todo-components/home/home.component';
import { authGuard } from './auth.guard';
import { LoginPageComponent } from './login-page/login-page/login-page.component';
import { loginGuard } from './login.guard';
export const routes: Routes = [
    {
      path: '',
      redirectTo: 'home',
      pathMatch: 'full'
    },
    {
      path: 'login',
      component: LoginPageComponent,
      canActivate: [loginGuard]   // 👈 block if logged in

    },
    {
      path: 'home',
      component: HomeComponent,
      canActivate: [authGuard]
    },
    {
      path: '**',
      redirectTo: 'home'
    }
  ];
  