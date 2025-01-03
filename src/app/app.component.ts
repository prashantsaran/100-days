import { Component, OnInit } from '@angular/core';
import { TodoGridComponent } from "./todo-components/todo-grid/todo-grid.component";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TodoService } from './todo-components/todo.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatProgressBarModule, MatProgressSpinnerModule,RouterOutlet,],
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
    this.todoService.initializeGridData();
    
    setTimeout(()=>{
      this.tasks=this.todoService.tasks;
      this.calculateProgress();
    },500)

    // this.themeService.setTheme('theme-light'); // Default theme

   
  }

  async fillData(){
    this.tasks = await this.todoService.getData()
  }

  onTasksUpdated(updatedTasks: any[]) {
    this.tasks = updatedTasks;
    this.calculateProgress();
  }


  calculateProgress() {
    if (!this.tasks || this.tasks.length === 0) {
      return; // Avoid calculations if tasks are not initialized
    }

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
