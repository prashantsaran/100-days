import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TodoService } from '../../todo-components/todo.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

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
  ],
  templateUrl: './add-delete-column-popup.component.html',
  styleUrls: ['./add-delete-column-popup.component.scss'],
})
export class AddDeleteColumnPopupComponent {
  columns: string[] = []; // Array to manage column names

  constructor(
    public dialogRef: MatDialogRef<AddDeleteColumnPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string[],
    private todoService: TodoService
  ) {
    // Initialize columns from existing task keys
    const sampleTask = this.todoService.tasks[0] || {};
    this.columns = Object.keys(sampleTask).filter((key) => key !== 'day' && key !== 'dayNumber' && key !== 'completed' && key !== 'isCompleted');
  }

  addColumn(): void {
    this.columns.push(''); // Add a blank column for editing
  }

  deleteColumn(index: number): void {
    const columnToDelete = this.columns[index];
    this.columns.splice(index, 1); // Remove column name

    // Remove the column from all tasks
    // this.todoService.tasks.forEach((task) => {
    //   delete task[columnToDelete];
    // });
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

    this.dialogRef.close(this.columns); // Close dialog with updated columns
  }

  closePopup(): void {
    this.dialogRef.close(); // Close dialog without saving
  }
}
