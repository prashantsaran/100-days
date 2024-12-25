import { Component } from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import { TodoCheckboxComponent } from '../todo-checkbox/todo-checkbox.component';

@Component({
  selector: 'todo-grid',
  standalone: true,
  imports: [MatTableModule,TodoCheckboxComponent],
  templateUrl: './todo-grid.component.html',
  styleUrl: './todo-grid.component.scss'
})
export class TodoGridComponent {
  displayedColumns: string[] = ['day','books', 'skills', 'meditate', 'exercise','completed'];
  dataSource = ELEMENT_DATA;
}

export interface PeriodicElement {
  skills: boolean;
  books: number;
  meditate: number;
  exercise: string;
  day : string;
  completed : string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { books: 1, skills: false, meditate: 1.0079, exercise: 'H', day: 'day1', completed: '25%' },
  { books: 2, skills: true, meditate: 4.0026, exercise: 'He', day: 'day2', completed: '30%' },
  { books: 3, skills: false, meditate: 6.941, exercise: 'Li', day: 'day3', completed: '45%' },
  { books: 4, skills: true, meditate: 9.0122, exercise: 'Be', day: 'day4', completed: '50%' },
  { books: 5, skills: false, meditate: 10.811, exercise: 'B', day: 'day5', completed: '35%' },
  { books: 6, skills: true, meditate: 12.0107, exercise: 'C', day: 'day6', completed: '60%' },
  { books: 7, skills: true, meditate: 14.0067, exercise: 'N', day: 'day7', completed: '70%' },
  { books: 8, skills: true, meditate: 15.9994, exercise: 'O', day: 'day8', completed: '80%' },
  { books: 9, skills: true, meditate: 18.9984, exercise: 'F', day: 'day9', completed: '90%' },
  { books: 10, skills: true, meditate: 20.1797, exercise: 'Ne', day: 'day10', completed: '100%' }
]
