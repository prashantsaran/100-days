import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TodoService {

 

  private collectionName = 'dayTable';

  constructor(private firestore: AngularFirestore,) {}

  // Add a new day record
  addDay(dayData: any): Promise<void> {
    const id = this.firestore.createId();
    return this.firestore.collection(this.collectionName).doc(id).set(dayData);
  }

  // Fetch all day records
  getDays(): Observable<any[]> {
    return this.firestore.collection(this.collectionName).valueChanges();
  }
}
