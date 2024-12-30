import { Injectable } from '@angular/core';
import { collection, Firestore, getDocs, orderBy, query } from '@angular/fire/firestore';

import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class TodoService {
  
  
  tasks: any[] = [];
FIRESTORE_COLLECTION = 'todoGrid'
  constructor(private firestore: Firestore) {}
  // private collectionName = 'dayTable';

  // constructor(private firestore: AngularFirestore,) {}

  // // Add a new day record
  // addDay(dayData: any): Promise<void> {
  //   const id = this.firestore.createId();
  //   return this.firestore.collection(this.collectionName).doc(id).set(dayData);
  // }

  // // Fetch all day records
  // getDays(): Observable<any[]> {
  //   return this.firestore.collection(this.collectionName).valueChanges();
  // }

  async getData() {
      const todoCollection = collection(this.firestore, this.FIRESTORE_COLLECTION);
      const orderedQuery = query(todoCollection, orderBy('dayNumber'));
      const querySnapshot = await getDocs(orderedQuery);
      const firebaseData = querySnapshot.docs.map((doc) => doc.data() );
      return firebaseData;
}



}
