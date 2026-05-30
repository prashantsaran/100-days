import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTooltipModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {
  @Input() tasks: any[] = [];

  get calendarDays(): any[] {
    return this.tasks.slice(0, 100);
  }

  getDayClass(task: any): string {
    const percent = this.getCompletedPercent(task);

    if (percent === 100) {
      return 'complete';
    }

    if (percent >= 50) {
      return 'partial';
    }

    if (percent > 0) {
      return 'started';
    }

    return 'empty';
  }

  getCompletedPercent(task: any): number {
    const value = task?.completed;

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      return Number(value.replace('%', '')) || 0;
    }

    return task?.isCompleted ? 100 : 0;
  }
}
