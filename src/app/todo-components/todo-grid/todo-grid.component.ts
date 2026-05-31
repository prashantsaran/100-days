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
  InputSignal,
  input,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Firestore } from '@angular/fire/firestore';
import { MatSnackBarModule ,MatSnackBar} from '@angular/material/snack-bar';
import {MatButtonModule} from '@angular/material/button';
import { TodoService } from '../todo.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../util/confirm-dialog/confirm-dialog.component';
import { TodoCheckboxComponent } from '../todo-checkbox/todo-checkbox/todo-checkbox.component';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AddDeleteColumnPopupComponent } from '../../popups/add-delete-column-popup/add-delete-column-popup.component';
import {MatCardModule} from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'todo-grid',
  standalone: true,
  imports: [MatTableModule, TodoCheckboxComponent, MatPaginatorModule,MatSnackBarModule,MatButtonModule,MatDialogModule,CommonModule,MatProgressSpinnerModule,MatCardModule,MatTooltipModule],
  templateUrl: './todo-grid.component.html',
  styleUrls: ['./todo-grid.component.scss'],
})
export class TodoGridComponent implements  AfterViewInit ,OnChanges ,OnInit,AfterViewInit{

  tasks: InputSignal<any[]> = input<any[]>([]);

  @Input() displayedColumns: string[] = [];

  get columns(){
    return this.todoService.displayedColumns;
  }

  dataSource = new MatTableDataSource<PeriodicElement>();
  @Output() tasksUpdated = new EventEmitter<any[]>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // private readonly STORAGE_KEY = 'todoGridData';
  // private readonly FIRESTORE_COLLECTION = 'todoGrid';
  totalFields: string[]=['books', 'skills', 'meditate'];

  constructor(private firestore: Firestore, private snackBar: MatSnackBar,private todoService:TodoService, private dialog: MatDialog) {
    // this.tasks=this.todoService.tasks;
  }



  ngOnChanges(changes: SimpleChanges) {
    if (changes['tasks'] && changes['tasks'].currentValue) {
      this.dataSource.data = changes['tasks'].currentValue;
      this.dataSource.paginator = this.paginator;
    }
  }
  getNumericValue(value: string): number {
    // Remove the '%' and convert to a number
    return parseFloat(value.replace('%', ''));
  }

  

  ngAfterViewInit(): void {
    this.dataSource.data= this.todoService.tasks;
    this.dataSource.paginator = this.paginator;

  }
  ngOnInit(){
this.todoService.initializeGridData();
  }


  onCheckboxChange(row: any, field: string, checked: boolean): void {
    row[field] = checked;
    // let flag=false;
    // row.isCompleted=true;
    row.isCompleted = Object.keys(row)
    .filter((key) => typeof row[key] === 'boolean' && key !== 'isCompleted') // Exclude 'isCompleted'
    .every((key) => row[key]); // Check if all boolean fields are true
  
  
    
    // row.isCompleted = row.books && row.skills && row.meditate && row.workout;

    this.todoService.updateAndGetCompletedPercentage(row);
    this.todoService.updateLocalCache(this.dataSource.data); 
    this.emitTaskData();
  }

  getCompletedTooltip(row: any): string {
    const totalFields = Object.keys(row).filter((key) => typeof row[key] === 'boolean' && key !== 'isCompleted');
    const completedCount = totalFields.filter((field) => row[field] === true).length;
    return `${completedCount} out of ${totalFields.length} task completed `;
  }

  isCompletedrow(row: any): boolean {
    const totalFields = Object.keys(row).filter((key) => typeof row[key] === 'boolean' && key !== 'isCompleted');
    const completedCount = totalFields.filter((field) => row[field] === true).length;
    return totalFields.length > 0 && totalFields.length === completedCount;
  }
  

  openAddorDeletePopup() {
    const dialogRef = this.dialog.open(AddDeleteColumnPopupComponent, {
      width: 'auto',
      minWidth: '560px',
      maxWidth: '95vw',
      panelClass: 'add-column-dialog',
      data: this.displayedColumns
    });

    dialogRef.afterClosed().subscribe((result: string[] |boolean |  undefined) => {
      if(result == true){
        return;
      }
      if (result) {
        this.totalFields=result;
        // refresh data reference so template reflects removed/added columns
        this.dataSource.data = this.todoService.tasks;
        // this.todoService.initializeGridData(this.displayedColumns);
        // this.dataSource.data=this.todoService.tasks;
      }
    });
    
  }    
  emitTaskData(): void {
    this.tasksUpdated.emit(this.dataSource.data);
  }



  saveGridData(): void {

  
    Promise.all([
      this.todoService.saveTasksToFirestore(this.dataSource.data),
      this.todoService.saveColumnConfigsToFirestore(),
    ])
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
      data: { message: 'Are you sure you want to reset all data?' ,
        confirm : 'Reset',
        cancel : 'Cancel',
      },
   
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.resetData();
      }
    });
  }

  resetData(): void {
    // Reset the data to default
    const defaultData = this.todoService.generateDefaultData(this.columns);
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
  day: string;
  dayNumber: number;
  completed: string;
  isCompleted?: boolean;
}
