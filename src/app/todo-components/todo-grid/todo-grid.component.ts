import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  Output,
  EventEmitter,
  ViewEncapsulation,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { collection, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { MatSnackBarModule ,MatSnackBar} from '@angular/material/snack-bar';
import {MatButtonModule} from '@angular/material/button';
import { TodoService } from '../todo.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../util/confirm-dialog/confirm-dialog.component';
import { TodoCheckboxComponent } from '../todo-checkbox/todo-checkbox/todo-checkbox.component';

@Component({
  selector: 'todo-grid',
  standalone: true,
  imports: [MatTableModule, TodoCheckboxComponent, MatPaginatorModule,MatSnackBarModule,MatButtonModule,MatDialogModule],
  templateUrl: './todo-grid.component.html',
  styleUrls: ['./todo-grid.component.scss'],
})
export class TodoGridComponent implements  AfterViewInit ,OnChanges ,OnInit{

  @Input()
  tasks :any[] = [];

  displayedColumns: string[] = [
    'day',
    'books',
    'skills',
    'meditate',
    'workout',
    'completed',
  ];

  dataSource = new MatTableDataSource<PeriodicElement>();
  @Output() tasksUpdated = new EventEmitter<any[]>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly STORAGE_KEY = 'todoGridData';
  private readonly FIRESTORE_COLLECTION = 'todoGrid';

  constructor(private firestore: Firestore, private snackBar: MatSnackBar,private todoService:TodoService, private dialog: MatDialog) {}



  ngOnChanges(changes: SimpleChanges) {
    if (changes['tasks'] && changes['tasks'].currentValue) {
      this.dataSource.data = changes['tasks'].currentValue;
      this.dataSource.paginator = this.paginator;
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
  ngOnInit(){
this.todoService.initializeGridData();
  }


  onCheckboxChange(row: any, field: string, checked: boolean): void {
    row[field] = checked;
    row.isCompleted = row.books && row.skills && row.meditate && row.workout;

    this.todoService.updateAndGetCompletedPercentage(row);
    this.todoService.updateLocalCache(this.dataSource.data); 
    this.emitTaskData();
  }

  emitTaskData(): void {
    this.tasksUpdated.emit(this.dataSource.data);
  }

  updateAndGetCompletedPercentage(row: any, updateRow: boolean = true): string {
    const totalFields = ['books', 'skills', 'meditate', 'workout'];
    const completedCount = totalFields.filter((field) => row[field] === true).length;
    const percentage = (completedCount / totalFields.length) * 100;

    if (updateRow) {
      row.completed = `${percentage}%`;
    }

    return `${percentage}%`;
  }

  saveGridData(): void {

  
    const todoCollection = collection(this.firestore, this.FIRESTORE_COLLECTION);
  
    const batchPromises = this.dataSource.data.map((row) =>
      setDoc(doc(todoCollection, row.day), {
        ...row,
        dayNumber: parseInt(row.day.split(' ')[1]),
      })
    );
  
    Promise.all(batchPromises)
      .then(() => {
        this.todoService.updateLocalCache(this.dataSource.data);
        console.log('Data successfully saved to Firestore!');
        this.snackBar.open('Data saved successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      })
      .catch((error) => {
        console.error('Error saving data to Firestore:', error);
        this.snackBar.open('Failed to save data. Please try again.', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      });
  }

  openResetDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: 'Are you sure you want to reset all data?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.resetData();
      }
    });
  }

  resetData(): void {
    // Reset the data to default
    const defaultData = this.todoService.generateDefaultData();
    this.dataSource.data = defaultData;
  
    this.saveGridData();
    
    // Update local cache and emit tasks
    this.todoService.updateLocalCache(defaultData);
    this.emitTaskData();

    // Show success snackbar
    this.snackBar.open('Data has been reset successfully!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
  
}

export interface PeriodicElement {
  skills: boolean;
  books: boolean;
  meditate: boolean;
  workout: boolean;
  day: string;
  dayNumber: number;
  completed: string;
  isCompleted?: boolean;
}
