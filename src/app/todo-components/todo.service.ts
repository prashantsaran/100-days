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
  private readonly FIRESTORE_COLLECTION = 'todoGrid';
  public updatedColumns :string[]=['books', 'skills', 'meditate', 'workout'];
  constructor(private firestore: Firestore) {}


  async getData() {
      const todoCollection = collection(this.firestore, this.FIRESTORE_COLLECTION);
      const orderedQuery = query(todoCollection, orderBy('dayNumber'));
      const querySnapshot = await getDocs(orderedQuery);
      const firebaseData = querySnapshot.docs.map((doc) => doc.data() );
      return firebaseData;
}

  async initializeGridData(gridColumns ?:string[]): Promise<void> {
    try {
      const cachedData = localStorage.getItem(this.STORAGE_KEY);
      const todoCollection = collection(this.firestore, this.FIRESTORE_COLLECTION);
      const orderedQuery = query(todoCollection, orderBy('dayNumber'));
      const querySnapshot = await getDocs(orderedQuery);

      if (cachedData && !gridColumns) {
        console.log('Loading data from local cache...',cachedData);
        this.tasks = JSON.parse(cachedData);
      } else if (!querySnapshot.empty && !gridColumns) {
        console.log('Loading data from Firestore...');
        const firebaseData = querySnapshot.docs.map((doc) => doc.data() as PeriodicElement);
        this.tasks = firebaseData;
        this.updateLocalCache(firebaseData);
      } else if(gridColumns){
        this.tasks= this.generateDefaultData(gridColumns);
      }
      else {
        console.log('Initializing new grid data...');
        this.tasks= this.generateDefaultData( [
          'day',
          'books',
          'skills',
          'meditate',
          'workout',
          'completed',
        ]);
        this.updateLocalCache(this.tasks);
      }
    } catch (error) {
      console.error('Error initializing grid data:', error);
    }
  }

   updateLocalCache(data: PeriodicElement[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  generateDefaultData(columns: string[]): PeriodicElement[] {
    const defaultColumns = ['day', 'completed', 'isCompleted'];
    const allColumns = Array.from(new Set([...defaultColumns, ...columns]));
  
    return Array.from({ length: 100 }, (_, index) => {
      const row: any = {
        day: `Day ${index + 1}`,
        dayNumber: index + 1,
        completed: 0, // Default completion percentage
        isCompleted: false, // Default completion status
      };
  
      // Add dynamic columns with default values
      allColumns.forEach((column) => {
        if (!defaultColumns.includes(column)) {
          row[column] = false; // Default value for new columns
        }
      });
  
      // Calculate completed percentage based on dynamic columns
      row.completed = this.updateAndGetCompletedPercentage(
        allColumns.reduce((acc: any, column) => {
          if (typeof row[column] === 'boolean') {
            acc[column] = row[column];
          }
          return acc;
        }, {}),
        false
      );
  
      return row;
    });
  }
  

      updateAndGetCompletedPercentage(row: any, updateRow: boolean = true): string {
        // const totalFields = ['books', 'skills', 'meditate', 'workout',];
        const completedCount = this.updatedColumns.filter((field) => row[field] === true).length;
        const percentage = (completedCount / this.updatedColumns.length) * 100;
    
        if (updateRow) {
          row.completed = `${percentage}%`;
        }
    
        return `${percentage}%`;
      }
    }
 


