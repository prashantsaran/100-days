import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'app-theme-dark';

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === 'true') {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
  }

  isDarkModeEnabled(): boolean {
    return document.body.classList.contains('dark-mode');
  }

  enableDarkMode(): void {
    document.body.classList.add('dark-mode');
    localStorage.setItem(this.STORAGE_KEY, 'true');
  }

  disableDarkMode(): void {
    document.body.classList.remove('dark-mode');
    localStorage.setItem(this.STORAGE_KEY, 'false');
  }

  toggle(): void {
    if (this.isDarkModeEnabled()) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
  }
}
