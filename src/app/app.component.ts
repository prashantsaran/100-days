import { Component } from '@angular/core';
import { TodoGridComponent } from "./todo-components/todo-grid/todo-grid.component";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatProgressBarModule, MatProgressSpinnerModule, TodoGridComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = '100-days';
}
