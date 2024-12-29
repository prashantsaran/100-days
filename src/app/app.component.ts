import { Component } from '@angular/core';
import { TodoGridComponent } from "./todo-components/todo-grid/todo-grid.component";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { collection, collectionData, Firestore, orderBy, query } from '@angular/fire/firestore';
import { TodoService } from './todo-components/todo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatProgressBarModule, MatProgressSpinnerModule, TodoGridComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = '100-days';

  constructor(private firestore: Firestore, private dayService: TodoService){
    console.log('@@@',firestore);
    
  }
// Tasks data received from todo-grid
tasks = Array.from({ length: 100 }, (_, i) => ({
  day: `Day ${i + 1}`,
  books: Math.random() > 0.5,
  skills: Math.random() > 0.5,
  meditate: Math.random() > 0.5,
  exercise: Math.random() > 0.5,
  isCompleted: false
}));

// Progress Percentages
weekCompletion = 0;
monthCompletion = 0;
overallCompletion = 0;

ngOnInit() {
  this.calculateProgress();
  this.dayService.getDays().subscribe((data) => {
   console.log('@@@',data);
  });
}

onTasksUpdated(updatedTasks: any[]) {
  this.tasks = updatedTasks;
  this.calculateProgress();
}

calculateProgress() {
  // Recalculate completion status for each task
  // this.tasks.forEach(task => {
  //   task.isCompleted = task.books && task.skills && task.meditate && task.exercise;
  // });

  // Weekly Progress (last week's percentage)
  const currentWeekTasks = this.getSegmentedTasks(7);
  this.weekCompletion = this.calculatePercentage(currentWeekTasks);

  // Monthly Progress (last month's percentage)
  const currentMonthTasks = this.getSegmentedTasks(30);
  this.monthCompletion = this.calculatePercentage(currentMonthTasks);

  // Overall Progress (all 100 days)
  this.overallCompletion = this.calculatePercentage(this.tasks);
}

getSegmentedTasks(days: number): any[] {
  // Get the last segment of 'days' from the tasks array
  return this.tasks.slice(-days);
}

calculatePercentage(tasks: any[]): number {
  const totalTasks = tasks.length;
  const completedTasks = this.tasks.filter(task => task.isCompleted).length;
  return Math.round((completedTasks % totalTasks)/totalTasks * 100);
}
}
