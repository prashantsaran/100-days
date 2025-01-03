import { Routes } from '@angular/router';
import { HomeComponent } from './todo-components/home/home.component';
import { authGuard } from './auth.guard';
import { LoginPageComponent } from './login-page/login-page/login-page.component';

export const routes: Routes = [
    {
        path:'',
        redirectTo :'login',
        pathMatch : 'full',
    },
    {
        path: 'login',
        component: LoginPageComponent
    },
    {
        path :'home',
        component : HomeComponent,
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];
