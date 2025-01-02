import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import {  MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule,MatSnackBarModule, ReactiveFormsModule, MatButtonModule,MatFormFieldModule , MatSelectModule, CommonModule,MatProgressSpinnerModule ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit {
  form!: FormGroup;
  isLoggingIn = false;
  isRecoveringPassword = false;
  isRegistering = false;

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  login(): void {
    if (this.form.invalid) return;

    this.isLoggingIn = true;
    const { email, password } = this.form.value;

    this.authService.signIn({ email, password }).subscribe({
      next: () => {
        this.isLoggingIn = false;
        this.authService.isUserLoggedIn = true;
        this.router.navigate(['home']);
      },
      error: (err) => {
        this.isLoggingIn = false;
        this.showError(err.message);
      },
    });
  }

  register(): void {
    if (this.form.invalid) return;

    this.isRegistering = true;
    const { email, password } = this.form.value;

    this.authService.register({ email, password }).subscribe({
      next: () => {
        this.isRegistering = false;
        this.snackBar.open('Registration successful! Please log in.', 'OK', {
          duration: 5000,
        });
      },
      error: (err) => {
        this.isRegistering = false;
        this.showError(err.message);
      },
    });
  }

  recoverPassword(): void {
    if (!this.form.get('email')?.value) {
      this.showError('Please enter your email to recover your password.');
      return;
    }

    this.isRecoveringPassword = true;
    const email = this.form.value.email;

    this.authService.recoverPassword(email).subscribe({
      next: () => {
        this.isRecoveringPassword = false;
        this.snackBar.open('Password recovery email sent!', 'OK', {
          duration: 5000,
        });
      },
      error: (err) => {
        this.isRecoveringPassword = false;
        this.showError(err.message);
      },
    });
  }

  signUpWithGoogle(): void {
    this.authService.signInWithGoogle().subscribe({
      next: (result) => {
        this.authService.isUserLoggedIn = true;
        this.router.navigate(['home']);
        this.snackBar.open('Signed in with Google successfully!', 'OK', {
          duration: 5000,
        });
      },
      error: (err) => {
        this.showError(err.message);
      },
    });
  }

  private showError(message: string): void {
    this.snackBar.open(`Error: ${message}`, 'OK', { duration: 5000 });
  }
}
