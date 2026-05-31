import { Injectable, signal } from '@angular/core';
import { collection, doc, Firestore, getDoc, getDocs, orderBy, query, setDoc } from '@angular/fire/firestore';

import { PeriodicElement } from './todo-grid/todo-grid.component';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ColumnConfig {
  name: string;
  startDay: number;
  endDay: number;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  private _tasks: any[] = [];
  private readonly COLUMN_CONFIGS_KEY = 'todoGridColumnConfigs';
  private readonly COLUMN_CONFIGS_DOC_ID = '__columnConfigs';
  public columnConfigs: ColumnConfig[] = [];
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

  private loadColumnConfigs(): boolean {
    const cachedConfig = localStorage.getItem(this.COLUMN_CONFIGS_KEY);
    if (cachedConfig) {
      try {
        this.columnConfigs = this.normalizeColumnConfigs(JSON.parse(cachedConfig) as ColumnConfig[]);
        this.saveColumnConfigs();
        return true;
      } catch {
        this.columnConfigs = [];
      }
    }

    return false;
  }

  saveColumnConfigs(): void {
    localStorage.setItem(this.COLUMN_CONFIGS_KEY, JSON.stringify(this.columnConfigs));
  }

  async loadColumnConfigsFromFirestore(): Promise<boolean> {
    const configRef = doc(this.firestore, environment.FIRESTORE_COLLECTION, this.COLUMN_CONFIGS_DOC_ID);
    const configSnapshot = await getDoc(configRef);

    if (!configSnapshot.exists()) {
      return false;
    }

    const configData = configSnapshot.data();
    const configs = Array.isArray(configData['columns']) ? configData['columns'] : [];
    this.columnConfigs = this.normalizeColumnConfigs(configs
      .filter((config: Partial<ColumnConfig>) => typeof config.name === 'string' && config.name.trim() !== '')
      .map((config: Partial<ColumnConfig>) => ({
        name: config.name!.trim(),
        startDay: Math.max(1, Math.min(100, Number(config.startDay) || 1)),
        endDay: Math.max(1, Math.min(100, Number(config.endDay) || 100)),
      })));
    this.saveColumnConfigs();

    return true;
  }

  async saveColumnConfigsToFirestore(): Promise<void> {
    const configRef = doc(this.firestore, environment.FIRESTORE_COLLECTION, this.COLUMN_CONFIGS_DOC_ID);
    await setDoc(configRef, {
      columns: this.columnConfigs,
      updatedAt: new Date().toISOString(),
    });
  }

  async saveTasksToFirestore(data: PeriodicElement[] = this.tasks): Promise<void> {
    const todoCollection = collection(this.firestore, environment.FIRESTORE_COLLECTION);

    await Promise.all(data.map((row) =>
      setDoc(doc(todoCollection, row.day), {
        ...row,
        dayNumber: row.dayNumber ?? parseInt(row.day.split(' ')[1]),
      })
    ));
  }

  setColumnConfigs(configs: ColumnConfig[]): void {
    this.columnConfigs = this.normalizeColumnConfigs(configs.map((config) => ({
      name: config.name,
      startDay: Math.min(config.startDay, config.endDay),
      endDay: Math.max(config.startDay, config.endDay),
    })));
    this.saveColumnConfigs();
    this.refreshDisplayedColumns();
    this.reconcileTasksWithColumnConfigs();
  }

  private normalizeColumnConfigs(configs: ColumnConfig[]): ColumnConfig[] {
    const configsByName = new Map<string, ColumnConfig>();

    configs.forEach((config) => {
      const name = config.name?.trim();

      if (!name) {
        return;
      }

      const key = name.toLowerCase();
      const startDay = Math.max(1, Math.min(100, Number(config.startDay) || 1));
      const endDay = Math.max(1, Math.min(100, Number(config.endDay) || 100));
      const normalizedConfig = {
        name,
        startDay: Math.min(startDay, endDay),
        endDay: Math.max(startDay, endDay),
      };
      const existingConfig = configsByName.get(key);

      configsByName.set(key, existingConfig
        ? {
            name: existingConfig.name,
            startDay: Math.min(existingConfig.startDay, normalizedConfig.startDay),
            endDay: Math.max(existingConfig.endDay, normalizedConfig.endDay),
          }
        : normalizedConfig
      );
    });

    return [...configsByName.values()];
  }

  private ensureColumnConfigsFromTasks(): void {
    const taskRanges = new Map<string, { startDay: number; endDay: number }>();

    this.tasks.forEach((task) => {
      Object.keys(task)
        .filter((key) => key !== 'day' && key !== 'dayNumber' && key !== 'completed' && key !== 'isCompleted')
        .forEach((key) => {
          const dayNumber = Number(task.dayNumber) || 1;
          const existingRange = taskRanges.get(key);

          taskRanges.set(key, {
            startDay: Math.min(existingRange?.startDay ?? dayNumber, dayNumber),
            endDay: Math.max(existingRange?.endDay ?? dayNumber, dayNumber),
          });
        });
    });

    this.columnConfigs = this.normalizeColumnConfigs([...taskRanges.entries()].map(([name, range]) => ({ name, ...range })));
  }

  private refreshDisplayedColumns(): void {
    this.columnConfigs = this.normalizeColumnConfigs(this.columnConfigs);
    this.displayedColumns = [
      'day',
      ...this.columnConfigs.map((config) => config.name),
      'completed',
    ];
  }

  reconcileTasksWithColumnConfigs(): void {
    const staticColumns = new Set(['day', 'dayNumber', 'completed', 'isCompleted']);
    const configuredColumns = new Set(this.columnConfigs.map((config) => config.name));

    this.tasks.forEach((task) => {
      Object.keys(task).forEach((key) => {
        if (!staticColumns.has(key) && !configuredColumns.has(key)) {
          delete task[key];
        }
      });

      this.columnConfigs.forEach((config) => {
        const active = task.dayNumber >= config.startDay && task.dayNumber <= config.endDay;

        if (active && !(config.name in task)) {
          task[config.name] = false;
        }

        if (!active && config.name in task) {
          delete task[config.name];
        }
      });

      this.updateAndGetCompletedPercentage(task, true);
      task.isCompleted = this.displayedColumns
        .filter((key) => key !== 'day' && key !== 'completed')
        .filter((key) => typeof task[key] === 'boolean')
        .every((key) => task[key]);
    });
  }

  async initializeGridData(gridColumns ?:string[]): Promise<void> {
    try {
      const hasLocalColumnConfigs = this.loadColumnConfigs();
      const cachedData = localStorage.getItem(environment.STORAGE_KEY);
      const todoCollection = collection(this.firestore, environment.FIRESTORE_COLLECTION);
      const orderedQuery = query(todoCollection, orderBy('dayNumber'));
      const querySnapshot = await getDocs(orderedQuery);
      const hasFirebaseColumnConfigs = hasLocalColumnConfigs ? true : await this.loadColumnConfigsFromFirestore();

      if (cachedData && !gridColumns) {
        console.log('Loading data from local cache...',cachedData);
        this.tasks = JSON.parse(cachedData);
      } else if (!querySnapshot.empty && !gridColumns) {
        console.log('Loading data from Firestore...');
        const firebaseData = querySnapshot.docs.map((doc) => doc.data() as PeriodicElement);
        this.tasks = firebaseData;
        this.updateLocalCache(firebaseData);
      } else if(gridColumns){
        // No special handling required for gridColumns parameter currently
      } else {
        console.log('Initializing new grid data...');
        this.tasks= this.generateDefaultData([
          'day',
          'books',
          'skills',
          'meditate',
          'completed',
        ]);
        this.updateLocalCache(this.tasks);
      }

      if (!hasFirebaseColumnConfigs && (!this.columnConfigs || this.columnConfigs.length === 0)) {
        this.ensureColumnConfigsFromTasks();
        this.saveColumnConfigs();
        await this.saveColumnConfigsToFirestore();
      }

      this.refreshDisplayedColumns();
      this.reconcileTasksWithColumnConfigs();
      this.updateLocalCache(this.tasks);
      await this.saveColumnConfigsToFirestore();
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
        const totalFields = this.displayedColumns
          .filter((x) => x !== 'completed' && x !== 'day')
          .filter((field) => typeof row[field] === 'boolean');
        const completedCount = totalFields.filter((field) => row[field] === true).length;
        const percentage = totalFields.length === 0 ? 0 : Math.round((completedCount / totalFields.length) * 100);

        if (updateRow) {
          row.completed = `${percentage}%`;
        }

        return `${percentage}%`;
      }

 getRandomQuote(): Observable<any> {
  return this.http.get(environment.quotsAPI, { responseType: 'text' });
  }

  clearCache() {
    localStorage.removeItem(environment.STORAGE_KEY)  }
      
}
