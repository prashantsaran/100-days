import { Injectable } from '@angular/core';
import { collection, Firestore, getDocs, orderBy, query } from '@angular/fire/firestore';

import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { PeriodicElement } from './todo-grid/todo-grid.component';
@Injectable({
  providedIn: 'root'
})
export class TodoService {
  
  
  tasks: any[] = [];
  private readonly STORAGE_KEY = 'todoGridData';
  private readonly FIRESTORE_COLLECTION = 'todoGrid'
  constructor(private firestore: Firestore) {}


  async getData() {
      const todoCollection = collection(this.firestore, this.FIRESTORE_COLLECTION);
      const orderedQuery = query(todoCollection, orderBy('dayNumber'));
      const querySnapshot = await getDocs(orderedQuery);
      const firebaseData = querySnapshot.docs.map((doc) => doc.data() );
      return firebaseData;
}

  async initializeGridData(): Promise<void> {
    try {
      const cachedData = localStorage.getItem(this.STORAGE_KEY);
      const todoCollection = collection(this.firestore, this.FIRESTORE_COLLECTION);
      const orderedQuery = query(todoCollection, orderBy('dayNumber'));
      const querySnapshot = await getDocs(orderedQuery);

      if (cachedData) {
        console.log('Loading data from local cache...');
        this.tasks = JSON.parse(cachedData);
      } else if (!querySnapshot.empty) {
        console.log('Loading data from Firestore...');
        const firebaseData = querySnapshot.docs.map((doc) => doc.data() as PeriodicElement);
        this.tasks = firebaseData;
        this.updateLocalCache(firebaseData);
      } else {
        console.log('Initializing new grid data...');
        this.tasks= this.generateDefaultData();
        this.updateLocalCache(this.tasks);
      }
    } catch (error) {
      console.error('Error initializing grid data:', error);
    }
  }

   updateLocalCache(data: PeriodicElement[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

     generateDefaultData(): PeriodicElement[] {
        return Array.from({ length: 100 }, (_, index) => ({
          day: `Day ${index + 1}`,
          dayNumber: index + 1,
          books: false,
          skills: false,
          meditate: false,
          exercise: false,
          completed: this.updateAndGetCompletedPercentage(
            { books: false, skills: false, meditate: false, exercise: false },
            false
          ),
          isCompleted: false,
        }));
      }

      updateAndGetCompletedPercentage(row: any, updateRow: boolean = true): string {
        const totalFields = ['books', 'skills', 'meditate', 'exercise'];
        const completedCount = totalFields.filter((field) => row[field] === true).length;
        const percentage = (completedCount / totalFields.length) * 100;
    
        if (updateRow) {
          row.completed = `${percentage}%`;
        }
    
        return `${percentage}%`;
      }
    }
 


