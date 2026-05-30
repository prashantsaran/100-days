import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './habits.component.html',
  styleUrl: './habits.component.scss'
})
export class HabitsComponent {
  @Input() tasks: any[] = [];
  @Input() columns: string[] = [];

  get habitColumns(): string[] {
    return this.columns.filter((column) => column !== 'day' && column !== 'completed');
  }

  getCompletedCount(column: string): number {
    return this.tasks.filter((task) => task?.[column]).length;
  }

  getCompletionRate(column: string): number {
    if (!this.tasks.length) {
      return 0;
    }

    return Math.round((this.getCompletedCount(column) / this.tasks.length) * 100);
  }
}
