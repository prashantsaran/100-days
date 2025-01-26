import { Injectable, signal } from '@angular/core';
import { collection, Firestore, getDocs, orderBy, query } from '@angular/fire/firestore';

import { PeriodicElement } from './todo-grid/todo-grid.component';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class TodoService {

  
  private _tasks: any[] = [];
  // private readonly STORAGE_KEY = 'todoGridData';
  // private readonly FIRESTORE_COLLECTION = 'todoGrid';
  public updatedColumns :string[]=['books', 'skills', 'meditate'];
  constructor(private firestore: Firestore,private http: HttpClient) {
  }

  set tasks(value: any[]){
    this._tasks = value;
  }
  get tasks(){
    return this._tasks;
  }
  x=signal('');

  _displayedColumns= signal([
    'day',
    'books',
    'skills',
    'meditate',
    'completed',
  ])

  // _displayedColumns: string[]=[ 'day',
  //   'books',
  //   'skills',
  //   'meditate',
  //   'completed',];

    set displayedColumns(value :string[]){
      this._displayedColumns.set(value);
    }
    get displayedColumns(){
      return this._displayedColumns();
    }


  async getData() {
      const todoCollection = collection(this.firestore, environment.FIRESTORE_COLLECTION);
      const orderedQuery = query(todoCollection, orderBy('dayNumber'));
      const querySnapshot = await getDocs(orderedQuery);
      const firebaseData = querySnapshot.docs.map((doc) => doc.data() );
      return firebaseData;
}

  async initializeGridData(gridColumns ?:string[]): Promise<void> {
    try {
      const cachedData = localStorage.getItem(environment.STORAGE_KEY);
      const todoCollection = collection(this.firestore, environment.FIRESTORE_COLLECTION);
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
    }
      else {
        console.log('Initializing new grid data...');
        this.tasks= this.generateDefaultData( [
          'day',
          'books',
          'skills',
          'meditate',
          'completed',
        ]);
        this.updateLocalCache(this.tasks);
      }

      const firstTask=this.tasks[0];
      this.displayedColumns = [
        'day',
        ...Object.keys(firstTask).filter(
          (key) => key !== 'dayNumber' && key !== 'isCompleted' && key !== 'day' && key !== 'completed'
        ),
        'completed',
      ];
            
    } catch (error) {
      console.error('Error initializing grid data:', error);
    }
  }

   updateLocalCache(data: PeriodicElement[]): void {
    localStorage.setItem(environment.STORAGE_KEY, JSON.stringify(data));
  }

  generateDefaultData(columns: string[]): PeriodicElement[] {
    const defaultColumns = ['day', 'completed', 'isCompleted'];
    const allColumns = Array.from(new Set([...defaultColumns, ...columns]));
  
    return Array.from({ length: 100 }, (_, index) => {
      const row: any = {
        day: `Day ${index + 1}`,
        dayNumber: index + 1,
        completed: 0,
        isCompleted: false, 
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
        const totalFields = this.displayedColumns.filter(x=> x!='completed' && x!='day');
        const completedCount = totalFields.filter((field) => row[field] === true).length;
        const percentage = Math.round((completedCount / totalFields.length) * 100);

      
        if (updateRow) {
          row.completed = `${percentage}%`;
        } 
    
        return `${percentage}%`;
      }

     
  getRandomQuote() :Observable<any>{
   {
      return this.http.get(environment.quotsAPI);
    }
  }

  clearCache() {
    localStorage.removeItem(environment.STORAGE_KEY)  }
      
}
