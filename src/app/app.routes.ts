import { Routes } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page/login-page.component';
import { HomeComponent } from './todo-components/home/home.component';

export const routes: Routes = [
    {
        path:'',
        component : LoginPageComponent
    },
    {
        path :'home',
        component : HomeComponent
    }
];
