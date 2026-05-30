import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-streaks',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './streaks.component.html',
  styleUrl: './streaks.component.scss'
})
export class StreaksComponent {
  @Input() tasks: any[] = [];
  @Input() columns: string[] = [];

  get habitColumns(): string[] {
    return this.columns.filter((column) => column !== 'day' && column !== 'completed');
  }

  getStreak(column: string): number {
    let streak = 0;

    for (let index = this.tasks.length - 1; index >= 0; index--) {
      if (this.tasks[index]?.[column]) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  getBestStreak(column: string): number {
    let best = 0;
    let current = 0;

    for (const task of this.tasks) {
      if (task?.[column]) {
        current++;
        best = Math.max(best, current);
      } else {
        current = 0;
      }
    }

    return best;
  }
}
