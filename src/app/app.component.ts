import { Component, OnInit } from '@angular/core';
import { TodoGridComponent } from "./todo-components/todo-grid/todo-grid.component";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TodoService } from './todo-components/todo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatProgressBarModule, MatProgressSpinnerModule, TodoGridComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = '100-days';

  // Tasks data received from todo-grid
  tasks: any[] = [];

  // Progress Percentages
  weekCompletion = 0;
  monthCompletion = 0;
  overallCompletion = 0;
  constructor(private todoService: TodoService) {}

   ngOnInit() {
    // Ensure tasks are initialized with default values
    // this.initializeTasks();
    this.fillData();
    setTimeout(()=>{
      this.calculateProgress();
    },500)
   
  }

  async fillData(){
    this.tasks = await this.todoService.getData()
  }

  onTasksUpdated(updatedTasks: any[]) {
    this.tasks = updatedTasks;
    this.calculateProgress();
  }

  // initializeTasks() {
  //   // Initialize tasks with default values if not already set
  //   if (!this.tasks || this.tasks.length === 0) {
  //     this.tasks = Array.from({ length: 100 }, (_, i) => ({
  //       day: `Day ${i + 1}`,
  //       books: false,
  //       skills: false,
  //       meditate: false,
  //       exercise: false,
  //       isCompleted: false
  //     }));
  //   }
  // }

  calculateProgress() {
    if (!this.tasks || this.tasks.length === 0) {
      return; // Avoid calculations if tasks are not initialized
    }

    // Recalculate completion status for each task
    // this.tasks.forEach(task => {
    //   task.isCompleted = task.books && task.skills && task.meditate && task.exercise;
    // });

    // Weekly Progress (last 7 days)
    const currentWeekTasks = this.getSegmentedTasks(7);
    this.weekCompletion = this.calculatePercentage(7);

    // Monthly Progress (last 30 days)
    const currentMonthTasks = this.getSegmentedTasks(30);
    this.monthCompletion = this.calculatePercentage(30);

    // Overall Progress (all 100 days)
    this.overallCompletion = this.calculatePercentage(100);
  }

getSegmentedTasks(days: number): any[] {
  // Get the last segment of 'days' from the tasks array
  return this.tasks.slice(-days);
}

  calculatePercentage(days: number): number {
    // const totalTasks = tasks.length;
    // if (totalTasks === 0) return 0; // Avoid division by zero
    const completedTasks = this.tasks.filter(task => task.isCompleted).length;
    return Math.round((completedTasks%days )/ days * 100);
  }
}
