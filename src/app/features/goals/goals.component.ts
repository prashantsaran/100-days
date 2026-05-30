import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent {
  @Input() tasks: any[] = [];

  get completedDays(): number {
    return this.tasks.filter((task) => task?.isCompleted).length;
  }

  get remainingDays(): number {
    return Math.max(100 - this.completedDays, 0);
  }

  get progress(): number {
    return Math.round((this.completedDays / 100) * 100);
  }

  get nextMilestone(): number {
    return [25, 50, 75, 100].find((milestone) => this.progress < milestone) || 100;
  }

  get milestoneGap(): number {
    return Math.max(this.nextMilestone - this.progress, 0);
  }
}
