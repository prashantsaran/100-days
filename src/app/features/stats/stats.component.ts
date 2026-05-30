import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent {
  @Input() tasks: any[] = [];
  @Input() columns: string[] = [];

  getTotalCompleted(): number {
    return this.tasks.filter(t => t.isCompleted).length;
  }

  getCurrentStreak(): number {
    let streak = 0;
    for (let i = this.tasks.length - 1; i >= 0; i--) {
      if (this.tasks[i].isCompleted) {
        streak++;
      } else break;
    }
    return streak;
  }

  getLongestStreak(): number {
    let maxStreak = 0, currentStreak = 0;
    for (const task of this.tasks) {
      if (task.isCompleted) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    return maxStreak;
  }

  getFavoriteHabit(): string {
    const habits: {[k: string]: number} = {};
    this.columns.forEach(col => {
      if (col !== 'day' && col !== 'completed') {
        habits[col] = this.tasks.filter(t => t[col]).length;
      }
    });

    const entries = Object.entries(habits);

    if (!entries.length) {
      return 'N/A';
    }

    return entries.reduce((best, current) => current[1] > best[1] ? current : best)[0];
  }
}
