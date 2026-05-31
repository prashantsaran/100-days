import { Injectable } from '@angular/core';
import { signInWithPopup, GoogleAuthProvider, getAuth } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { catchError, from, Observable, throwError } from 'rxjs';
import { TodoService } from '../todo-components/todo.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private readonly SESSION_KEY = 'isUserLoggedIn';
  private isLoggedIn: boolean = false;

  constructor(private auth: AngularFireAuth, private router: Router, private todoService: TodoService) {

    // 🔁 Restore login on refresh using Firebase auth state
    this.auth.authState.subscribe(user => {
      if (user) {
        sessionStorage.setItem(this.SESSION_KEY, 'true');
        this.isLoggedIn = true;
      } else {
        sessionStorage.removeItem(this.SESSION_KEY);
        this.isLoggedIn = false;
      }
    });
  }

  // 🔐 Getter
  get isUserLoggedIn(): boolean {
    return sessionStorage.getItem(this.SESSION_KEY) === 'true';
  }

  // 🔐 Setter
  set isUserLoggedIn(value: boolean) {
    this.isLoggedIn = value;

    if (value) {
      sessionStorage.setItem(this.SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(this.SESSION_KEY);
    }
  }

  // 📧 Email/Password Login
  signIn(params: SignIn): Observable<any> {
    return from(
      this.auth.signInWithEmailAndPassword(params.email, params.password)
        .then(result => {
          this.isUserLoggedIn = true;
          return result;
        })
    ).pipe(
      catchError((error: FirebaseError) =>
        throwError(() => new Error(this.translateFirebaseErrorMessage(error)))
      )
    );
  }

  // 📝 Register
  register(params: Register): Observable<any> {
    return from(
      this.auth.createUserWithEmailAndPassword(params.email, params.password)
        .then(result => {
          this.isUserLoggedIn = true;
          return result;
        })
    ).pipe(
      catchError((error: FirebaseError) =>
        throwError(() => new Error(this.translateFirebaseErrorMessage(error)))
      )
    );
  }

  // 🔑 Google Login
  signInWithGoogle(): Observable<any> {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    return from(
      signInWithPopup(auth, provider)
        .then(result => {
          this.isUserLoggedIn = true;
          return result;
        })
    );
  }

  // 🔁 Password Recovery
  recoverPassword(email: string): Observable<void> {
    return from(this.auth.sendPasswordResetEmail(email)).pipe(
      catchError((error: FirebaseError) =>
        throwError(() => new Error(this.translateFirebaseErrorMessage(error)))
      )
    );
  }

  // 🚪 Logout
  signOut(): void {
    this.auth.signOut().then(() => {
      this.isUserLoggedIn = false;
      this.todoService.clearCache();
      sessionStorage.removeItem(this.SESSION_KEY);
      this.router.navigate(['/login']);
    });
  }

  // 🧠 Error Mapper
  private translateFirebaseErrorMessage({ code, message }: FirebaseError): string {
    if (code === 'auth/email-already-in-use') {
      return 'This email is already in use.';
    }
    if (code === 'auth/weak-password') {
      return 'The password must be at least 6 characters.';
    }
    return message;
  }
}

/* ===================== TYPES ===================== */

type SignIn = {
  email: string;
  password: string;
};

type Register = {
  email: string;
  password: string;
};

type FirebaseError = {
  code: string;
  message: string;
};
