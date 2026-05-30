import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TodoService } from '../../todo-components/todo.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {MatIconModule} from '@angular/material/icon';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-add-delete-column-popup',
  standalone: true,
  imports: [
    // Angular Material imports and common modules
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './add-delete-column-popup.component.html',
  styleUrls: ['./add-delete-column-popup.component.scss'],
})
export class AddDeleteColumnPopupComponent {
  columns: string[] = []; // Array to manage column names
  originalColumns: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddDeleteColumnPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string[],
    private todoService: TodoService,
    private snackBar: MatSnackBar,
  ) {
    // Initialize columns from existing task keys
    const sampleTask = this.todoService.tasks[0] || {};
    this.columns = Object.keys(sampleTask).filter((key) => key !== 'day' && key !== 'dayNumber' && key !== 'completed' && key !== 'isCompleted');
    // keep a copy for detecting removals
    this.originalColumns = [...this.columns];
  }

  addColumn(): void {
    this.columns.push(''); // Add a blank column for editing
  }

  deleteColumn(index: number): void {
    if(this.columns.length<2){
      this.snackBar.open('There must be at least one column', 'OK', {
        duration: 5000,
      });
      return;
    }
    const columnToDelete = this.columns[index];

    this.columns.splice(index, 1); // Remove column name

    // Remove the column from all tasks
    this.todoService.tasks.forEach((task) => {
      if (columnToDelete in task) {
        delete task[columnToDelete];
      }
    });
    // Recompute completed percentage and isCompleted for each task, then persist
    this.todoService.tasks.forEach((task) => {
      this.todoService.updateAndGetCompletedPercentage(task, true);
      task.isCompleted = Object.keys(task)
        .filter((key) => typeof task[key] === 'boolean' && key !== 'isCompleted')
        .every((key) => task[key]);
    });
    this.todoService.updateLocalCache(this.todoService.tasks);
  }

  saveColumns(): void {
    // Filter out empty or invalid column names
    this.columns = this.columns.filter((column) => column.trim() !== '');

    // Add new columns to all tasks
    this.todoService.tasks.forEach((task) => {
      this.columns.forEach((column) => {
        if (!(column in task)) {
          task[column] = false; // Initialize new columns with default value
        }
      });
    });

    // Remove any columns that were present originally but removed now
    const removed = this.originalColumns.filter(col => !this.columns.includes(col));
    if (removed.length) {
      this.todoService.tasks.forEach((task) => {
        removed.forEach((col) => {
          if (col in task) delete task[col];
        });
      });
    }

    // Recompute completed percentage and isCompleted for each task, then persist
    this.todoService.tasks.forEach((task) => {
      this.todoService.updateAndGetCompletedPercentage(task, true);
      task.isCompleted = Object.keys(task)
        .filter((key) => typeof task[key] === 'boolean' && key !== 'isCompleted')
        .every((key) => task[key]);
    });
    this.todoService.updateLocalCache(this.todoService.tasks);

    this.dialogRef.close(this.columns); // Close dialog with updated columns
  }

  closePopup(): void {
    this.dialogRef.close(); // Close dialog without saving
  }
  trackByIndex(index: number, column: string): number {
    return index; // Return the index to track the specific input elements
  }
  
}

