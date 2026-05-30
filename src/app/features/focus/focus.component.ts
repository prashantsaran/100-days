import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-focus',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule],
  templateUrl: './focus.component.html',
  styleUrl: './focus.component.scss'
})
export class FocusComponent {
  @Input() tasks: any[] = [];
  @Input() columns: string[] = [];

  get nextTask(): any | undefined {
    return this.tasks.find((task) => !task?.isCompleted);
  }

  get pendingHabits(): string[] {
    if (!this.nextTask) {
      return [];
    }

    return this.columns.filter((column) => column !== 'day' && column !== 'completed' && !this.nextTask[column]);
  }
}
