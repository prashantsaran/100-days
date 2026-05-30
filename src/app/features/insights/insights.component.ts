import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule],
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.scss'
})
export class InsightsComponent {
  @Input() tasks: any[] = [];
  @Input() columns: string[] = [];

  get insights(): string[] {
    const habitColumns = this.columns.filter((column) => column !== 'day' && column !== 'completed');
    const completedDays = this.tasks.filter((task) => task?.isCompleted).length;
    const bestHabit = habitColumns
      .map((column) => ({
        column,
        count: this.tasks.filter((task) => task?.[column]).length
      }))
      .sort((a, b) => b.count - a.count)[0];

    return [
      `You have completed ${completedDays} full days so far.`,
      bestHabit ? `${this.toTitle(bestHabit.column)} is your strongest habit with ${bestHabit.count} completed days.` : 'Add habits to unlock stronger insights.',
      this.getRecentMomentum()
    ];
  }

  private getRecentMomentum(): string {
    const recent = this.tasks.slice(-7);
    const completed = recent.filter((task) => task?.isCompleted).length;

    if (!recent.length) {
      return 'Start logging days to build weekly momentum.';
    }

    return `Your last 7 days include ${completed} fully completed days.`;
  }

  private toTitle(value: string): string {
    return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
