import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { TodoCheckboxComponent } from '../todo-checkbox/todo-checkbox.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { collection, doc, Firestore, getDocs, setDoc, query, orderBy } from '@angular/fire/firestore';
import { MatSnackBarModule ,MatSnackBar} from '@angular/material/snack-bar';
import {MatButtonModule} from '@angular/material/button';
@Component({
  selector: 'todo-grid',
  standalone: true,
  imports: [MatTableModule, TodoCheckboxComponent, MatPaginatorModule,MatSnackBarModule,MatButtonModule],
  templateUrl: './todo-grid.component.html',
  styleUrls: ['./todo-grid.component.scss'],
})
export class TodoGridComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'day',
    'books',
    'skills',
    'meditate',
    'exercise',
    'completed',
  ];
  dataSource = new MatTableDataSource<PeriodicElement>();
  @Output() tasksUpdated = new EventEmitter<any[]>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly STORAGE_KEY = 'todoGridData';
  private readonly FIRESTORE_COLLECTION = 'todoGrid';

  constructor(private firestore: Firestore, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.initializeGridData();
    setTimeout(() => {
      this.ngAfterViewInit();
    }, 200);

    this.emitTaskData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  async initializeGridData(): Promise<void> {
    try {
      const cachedData = localStorage.getItem(this.STORAGE_KEY);
      const todoCollection = collection(this.firestore, this.FIRESTORE_COLLECTION);
      const orderedQuery = query(todoCollection, orderBy('dayNumber'));
      const querySnapshot = await getDocs(orderedQuery);

      if (cachedData) {
        console.log('Loading data from local cache...');
        this.dataSource.data = JSON.parse(cachedData);
      } else if (!querySnapshot.empty) {
        console.log('Loading data from Firestore...');
        const firebaseData = querySnapshot.docs.map((doc) => doc.data() as PeriodicElement);
        this.dataSource.data = firebaseData;
        this.updateLocalCache(firebaseData);
      } else {
        console.log('Initializing new grid data...');
        this.dataSource.data = this.generateDefaultData();
        this.updateLocalCache(this.dataSource.data);
      }
    } catch (error) {
      console.error('Error initializing grid data:', error);
    }
  }

  onCheckboxChange(row: any, field: string, checked: boolean): void {
    row[field] = checked;
    this.updateAndGetCompletedPercentage(row);
    this.updateLocalCache(this.dataSource.data); // Update local cache only
    this.emitTaskData();
  }

  emitTaskData(): void {
    this.tasksUpdated.emit(this.dataSource.data);
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

  saveGridData(): void {

    this.snackBar.open('Data saved successfully!', 'Close', {
      duration: 100000, // Show for 3 seconds
      panelClass: 'top-right-snackbar',
    });
  
    // const todoCollection = collection(this.firestore, this.FIRESTORE_COLLECTION);
  
    // const batchPromises = this.dataSource.data.map((row) =>
    //   setDoc(doc(todoCollection, row.day), {
    //     ...row,
    //     dayNumber: parseInt(row.day.split(' ')[1]),
    //   })
    // );
  
    // Promise.all(batchPromises)
    //   .then(() => {
    //     this.updateLocalCache(this.dataSource.data);
    //     console.log('Data successfully saved to Firestore!');
    //     this.snackBar.open('Data saved successfully!', 'Close', {
    //       duration: 30000, // Show for 3 seconds
    //       horizontalPosition: 'center',
    //       verticalPosition: 'bottom',
    //     });
    //   })
    //   .catch((error) => {
    //     console.error('Error saving data to Firestore:', error);
    //     this.snackBar.open('Failed to save data. Please try again.', 'Close', {
    //       duration: 3000,
    //       horizontalPosition: 'center',
    //       verticalPosition: 'bottom',
    //     });
      // });
  }
  
  private updateLocalCache(data: PeriodicElement[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  private generateDefaultData(): PeriodicElement[] {
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
}

export interface PeriodicElement {
  skills: boolean;
  books: boolean;
  meditate: boolean;
  exercise: boolean;
  day: string;
  dayNumber: number;
  completed: string;
  isCompleted?: boolean;
}
