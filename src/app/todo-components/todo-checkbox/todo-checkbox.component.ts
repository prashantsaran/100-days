import { Component, input, InputSignal } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'todo-checkbox',
  standalone: true,
  imports: [MatCheckboxModule],
  templateUrl: './todo-checkbox.component.html',
  styleUrl: './todo-checkbox.component.scss'
})
export class TodoCheckboxComponent {
  checked: InputSignal<boolean> = input(false) ;
}
