import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { TodoCheckboxComponent } from '../todo-checkbox/todo-checkbox.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'todo-grid',
  standalone: true,
  imports: [MatTableModule, TodoCheckboxComponent, MatPaginatorModule],
  templateUrl: './todo-grid.component.html',
  styleUrls: ['./todo-grid.component.scss'],
})
export class TodoGridComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['day', 'books', 'skills', 'meditate', 'exercise', 'completed'];
  dataSource = new MatTableDataSource<PeriodicElement>();

  @ViewChild(MatPaginator) paginator !: MatPaginator;

  ngOnInit(): void {
    this.initializeGridData();
  }

  ngAfterViewInit(): void {
    // Assign paginator to the dataSource after view initialization
    this.dataSource.paginator = this.paginator;
  }

  initializeGridData(): void {
    // Generate 100 rows with default values
    this.dataSource.data = Array.from({ length: 100 }, (_, index) => ({
      day: `Day ${index + 1}`,
      books: false,
      skills: false,
      meditate: false,
      exercise: false,
      completed: this.updateAndGetCompletedPercentage({ books: false, skills: false, meditate: false, exercise: false }, false), // Initial value
    }));
  }

  onCheckboxChange(row: any, field: string, checked: boolean): void {
    row[field] = checked;
    this.updateAndGetCompletedPercentage(row);
  }

  updateAndGetCompletedPercentage(row: any, updateRow: boolean = true): string {
    const totalFields = ['books', 'skills', 'meditate', 'exercise'];
    const completedCount = totalFields.filter(field => row[field] === true).length;
    const percentage = (completedCount / totalFields.length) * 100;

    if (updateRow) {
      row.completed = `${percentage}%`;
    }

    return `${percentage}%`;
  }
}

export interface PeriodicElement {
  skills: boolean;
  books: boolean;
  meditate: boolean;
  exercise: boolean;
  day: string;
  completed: string;
}
