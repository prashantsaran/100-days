import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatSnackBarModule],
  templateUrl: './export.component.html',
  styleUrl: './export.component.scss'
})
export class ExportComponent {
  @Input() tasks: any[] = [];

  constructor(private snackBar: MatSnackBar) {}

  copyJson(): void {
    navigator.clipboard.writeText(JSON.stringify(this.tasks, null, 2));
    this.snackBar.open('JSON copied to clipboard', 'Close', { duration: 2500 });
  }

  downloadJson(): void {
    const blob = new Blob([JSON.stringify(this.tasks, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = '100-days-progress.json';
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
