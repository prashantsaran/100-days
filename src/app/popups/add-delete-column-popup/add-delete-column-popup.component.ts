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
import { MatTooltipModule } from '@angular/material/tooltip';

interface ColumnConfig {
  name: string;
  startDay: number;
  endDay: number;
  existing?: boolean;
}

@Component({
  selector: 'app-add-delete-column-popup',
  standalone: true,
  imports: [
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
  columns: ColumnConfig[] = [];
  originalColumns: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddDeleteColumnPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string[],
    private todoService: TodoService,
    private snackBar: MatSnackBar,
  ) {
    this.columns = this.todoService.columnConfigs.map((column) => ({ ...column, existing: true }));
    this.originalColumns = this.columns.map((column) => column.name);
  }

  addColumn(): void {
    this.columns.push({ name: '', startDay: 1, endDay: 100 });
  }

  async deleteColumn(index: number): Promise<void> {
    if (this.columns.length < 2) {
      this.snackBar.open('There must be at least one column', 'OK', {
        duration: 5000,
      });
      return;
    }

    const columnToDelete = this.columns[index].name;
    this.columns.splice(index, 1);

    if (columnToDelete) {
      this.todoService.tasks.forEach((task) => {
        if (columnToDelete in task) {
          delete task[columnToDelete];
        }
      });
      this.todoService.tasks.forEach((task) => {
        this.todoService.updateAndGetCompletedPercentage(task, true);
        task.isCompleted = Object.keys(task)
          .filter((key) => typeof task[key] === 'boolean' && key !== 'isCompleted')
          .every((key) => task[key]);
      });
      await this.todoService.updateLocalCache(this.todoService.tasks);
    }
  }

  async saveColumns(): Promise<void> {
    const validColumns = this.columns
      .map((column) => ({
        ...column,
        name: column.name.trim(),
        startDay: Math.max(1, Math.min(100, column.startDay)),
        endDay: Math.max(1, Math.min(100, column.endDay)),
      }))
      .filter((column) => column.name !== '');

    if (validColumns.length !== this.columns.length) {
      this.snackBar.open('Please fill in every column name before saving.', 'OK', {
        duration: 5000,
      });
      return;
    }

    const duplicateNames = validColumns
      .map((c) => c.name.toLowerCase())
      .filter((name, index, arr) => arr.indexOf(name) !== index);
    if (duplicateNames.length > 0) {
      this.snackBar.open('Column names must be unique.', 'OK', {
        duration: 5000,
      });
      return;
    }

    this.columns = validColumns;
    await this.todoService.setColumnConfigs(this.columns);

    const removed = this.originalColumns.filter((col) => !this.columns.map((c) => c.name).includes(col));
    if (removed.length) {
      this.todoService.tasks.forEach((task) => {
        removed.forEach((col) => {
          if (col in task) delete task[col];
        });
      });
    }

    this.todoService.reconcileTasksWithColumnConfigs();

    await this.todoService.updateLocalCache(this.todoService.tasks);

    try {
      await Promise.all([
        this.todoService.saveColumnConfigsToFirestore(),
        this.todoService.saveTasksToFirestore(),
      ]);
      this.dialogRef.close(this.columns.map((c) => c.name));
    } catch {
      this.snackBar.open('Saved locally, but Firebase save failed. Please try Save Changes again.', 'OK', {
        duration: 5000,
      });
    }
  }

  closePopup(): void {
    this.dialogRef.close();
  }

  trackByIndex(index: number): number {
    return index;
  }
}
