import { AfterContentChecked, AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TodoGridComponent } from '../todo-grid/todo-grid.component';
import { TodoService } from '../todo.service';
import { AuthenticationService } from '../../services/authentication.service';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialogComponent } from '../../util/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { exhaustMap, Subject, tap } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatProgressBarModule, MatProgressSpinnerModule, TodoGridComponent,MatButtonModule,MatIconModule,CommonModule, MatTooltipModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit , AfterContentChecked{


  title = '100-days';
  @ViewChild(TodoGridComponent) todoGrid!: TodoGridComponent;

  quote:string='Nothing works unless you do';

  // Tasks data received from todo-grid
  // tasks: any[] = [];



  // Progress Percentages
  weekCompletion = 0;
  monthCompletion = 0;
  overallCompletion = 0;
  _displayedColumns:string[]=[];
  isRotating: boolean=false;
  
  constructor(private todoService: TodoService,private authService : AuthenticationService, private dialog: MatDialog) {
    
  }

  ngAfterContentChecked() {
        this.calculateProgress();
  }


  get displayedColumns(){
    return this.todoService.displayedColumns;
  }
  
  get tasks(){
    return this.todoService.tasks;
  }

  set tasks(value:any[]){
    this.todoService.tasks = value;
  }

  private refreshClick$ = new Subject<void>();

   ngOnInit() {
    this.todoService.initializeGridData();
    
    setTimeout(()=>{
      this.tasks=this.todoService.tasks;

    },500)
    this.refreshQuotes();
    this.refreshClick$
    .pipe(
      tap(() => (this.isRotating = true)), 
      exhaustMap(() =>
        this.todoService.getRandomQuote().pipe(
          tap({
            next: (data: any) => {
              this.quote = data.content;
              this.isRotating = false;
            },
            error: () => (this.isRotating = false)
          })
        )
      )
    )
    .subscribe();
   
  }

    saveGridData() {
    this.todoGrid.saveGridData();
    }
    openResetDialog() {
      this.todoGrid.openResetDialog();
    }

  refreshQuotes() {
    this.todoService.getRandomQuote().subscribe((quoteText: string) => {
    const quote = this.extractQuote(quoteText);
    
    // Count number of words
    const wordCount = quote.trim().split(/\s+/).length;

    if (wordCount > 15) {
      this.refreshQuotes();
    } else {
      // Good length, show it
      this.quote = quote;
    }
  });
    // this.refreshClick$.next(); 
  }
  extractQuote(raw: string): string {
    // Extract text between 'Quote: ' and ' Author:'
    const match = raw.match(/Quote:\s*(.*?)\s*Author:/);
    return match ? match[1] : 'Quote not found';
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

       this.overallCompletion = this.calculate100DaysProgress();
  }


calculate100DaysProgress(): number {
  if (!this.tasks || this.tasks.length === 0) {
    return 0;
  }

  let totalBooleanProps = 0;
  let trueProps = 0;

for(const key in this.tasks[0]){
  if(typeof this.tasks[0][key] === 'boolean') {
    totalBooleanProps++;
  }
}

  for (const task of this.tasks) {

    for (const key in task) {
      if (typeof task[key] === 'boolean') {
        if (task[key]) {
          trueProps++;
        }
      }
    }
  }

  return Math.round((trueProps / (totalBooleanProps*100)) * 100);
}

getSegmentedTasks(days: number): any[] {
  return this.tasks.slice(-days);
}

  calculatePercentage(days: number): number {

    const completedTasks = this.tasks.filter(task => task.isCompleted).length;
    return Math.round((completedTasks%days )/ days * 100);
  }
}
