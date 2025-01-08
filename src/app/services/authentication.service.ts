import { Injectable } from '@angular/core';
import { signInWithPopup,GoogleAuthProvider,getAuth } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { catchError, from, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private auth: AngularFireAuth, private router: Router) {
    this.isUserLoggedIn = localStorage.getItem('isUserLoggedIn') === 'true';
   }

  private isLoggedIn:boolean = false;

  get isUserLoggedIn():boolean{
    return localStorage.getItem('isUserLoggedIn') === 'true';
  }

  set isUserLoggedIn(value:boolean){
    localStorage.setItem('isUserLoggedIn', value.toString());
    this.isLoggedIn = value;
  }

  signIn(params: SignIn): Observable<any> {
    return from(this.auth.signInWithEmailAndPassword(params.email, params.password)).pipe(
      catchError((error: FirebaseError) =>
        throwError(() => new Error(this.translateFirebaseErrorMessage(error)))
      )
    );
  }

  recoverPassword(email: string): Observable<void> {
    return from(this.auth.sendPasswordResetEmail(email)).pipe(
      catchError((error: FirebaseError) =>
        throwError(() => new Error(this.translateFirebaseErrorMessage(error)))
      )
    );
  }

  register(params: Register): Observable<any> {
    return from(this.auth.createUserWithEmailAndPassword(params.email, params.password)).pipe(
      catchError((error: FirebaseError) =>
        throwError(() => new Error(this.translateFirebaseErrorMessage(error)))
      )
    );
  }

  private translateFirebaseErrorMessage({ code, message }: FirebaseError): string {
    if (code === "auth/email-already-in-use") {
      return "This email is already in use.";
    }
    if (code === "auth/weak-password") {
      return "The password must be at least 6 characters.";
    }
    return message;
  }

  signOut(): void {
    this.isUserLoggedIn = false;
    localStorage.removeItem('isUserLoggedIn');
    this.router.navigate(['/login']);
  }

  signInWithGoogle(): Observable<any> {
    const auth = getAuth(); // Ensure Firebase is initialized
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(auth, provider));
  }
}

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
