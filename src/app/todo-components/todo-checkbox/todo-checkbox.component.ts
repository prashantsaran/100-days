import { Component, EventEmitter, input, InputSignal, Output } from '@angular/core';
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

  @Output() stateChange = new EventEmitter<boolean>();

  onChange(checked: boolean): void {
    this.stateChange.emit(checked);
  }

}
