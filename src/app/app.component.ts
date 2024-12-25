import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { TodoCheckboxComponent } from './todo-components/todo-checkbox/todo-checkbox.component';
import { TodoGridComponent } from "./todo-components/todo-grid/todo-grid.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TodoCheckboxComponent, TodoGridComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = '100-days';
}
