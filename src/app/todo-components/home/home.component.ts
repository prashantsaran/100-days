import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TodoGridComponent } from '../todo-grid/todo-grid.component';
import { RouterOutlet } from '@angular/router';
import { TodoService } from '../todo.service';
import { AuthenticationService } from '../../services/authentication.service';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialogComponent } from '../../util/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatProgressBarModule, MatProgressSpinnerModule, TodoGridComponent,MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {


  title = '100-days';
  @ViewChild(TodoGridComponent) todoGrid!: TodoGridComponent;

  // Tasks data received from todo-grid
  tasks: any[] = [];

  // Progress Percentages
  weekCompletion = 0;
  monthCompletion = 0;
  overallCompletion = 0;
  constructor(private todoService: TodoService,private authService : AuthenticationService, private dialog: MatDialog) {}

   ngOnInit() {
    this.todoService.initializeGridData();
    
    setTimeout(()=>{
      this.tasks=this.todoService.tasks;
      this.calculateProgress();
    },500)
   
  }

    saveGridData() {
    this.todoGrid.saveGridData();
    }
    openResetDialog() {
      this.todoGrid.openResetDialog();
    }

    openAddorDeletePopup() {
      this.todoGrid.openAddorDeletePopup();
      }

  async fillData(){
    this.tasks = await this.todoService.getData()
  }

  onTasksUpdated(updatedTasks: any[]) {
    this.tasks = updatedTasks;
    this.calculateProgress();
  }

  logOut(){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: '300px',
          data: { message: 'Are you sure you want to Logout?' ,
            confirm : 'Logout',
            cancel : 'Cancel'
          },
        });
    
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.authService.signOut();
          }
        });
    
      }

  calculateProgress() {
    if (!this.tasks || this.tasks.length === 0) {
      return; 
    }

    const currentWeekTasks = this.getSegmentedTasks(7);
    this.weekCompletion = this.calculatePercentage(7);

    const currentMonthTasks = this.getSegmentedTasks(30);
    this.monthCompletion = this.calculatePercentage(30);

    this.overallCompletion = this.calculatePercentage(100);
  }

getSegmentedTasks(days: number): any[] {
  return this.tasks.slice(-days);
}

  calculatePercentage(days: number): number {

    const completedTasks = this.tasks.filter(task => task.isCompleted).length;
    return Math.round((completedTasks%days )/ days * 100);
  }
}
