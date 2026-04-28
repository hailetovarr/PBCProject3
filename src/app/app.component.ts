import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="nav">
      <div class="nav-container">
        <div class="nav-brand">
          <i class="fas fa-wallet"></i> Budget Tracker
        </div>
        <ul class="nav-links">
          <li>
            <a routerLink="/summary" routerLinkActive="active" class="nav-link">
              <i class="fas fa-chart-pie"></i> Summary
            </a>
          </li>
          <li>
            <a routerLink="/income" routerLinkActive="active" class="nav-link">
              <i class="fas fa-plus-circle"></i> Income
            </a>
          </li>
          <li>
            <a routerLink="/expenses" routerLinkActive="active" class="nav-link">
              <i class="fas fa-minus-circle"></i> Expenses
            </a>
          </li>
        </ul>
      </div>
    </nav>
    
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .nav-brand i {
      margin-right: 8px;
    }
    
    .nav-link i {
      margin-right: 6px;
    }
  `]
})
export class AppComponent {
  title = 'Personal Budget Tracker';
}
