import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule], // استيراد الـ RouterModule مهم جداً
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm">
      <div class="container">
        <a class="navbar-brand fw-bold" href="#">🎓 Unified Forgery Detection</a>
        <div class="collapse navbar-collapse d-flex justify-content-end">
          <ul class="navbar-nav gap-2">
            <li class="nav-item">
              <a class="nav-link btn btn-outline-light border-0" routerLink="/issue" routerLinkActive="active">
                <i class="bi bi-award me-1"></i> Issue Degree
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link btn btn-outline-light border-0" routerLink="/verify" routerLinkActive="active">
                <i class="bi bi-shield-check me-1"></i> Verify
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link btn btn-outline-light border-0" routerLink="/manage" routerLinkActive="active">
                <i class="bi bi-database me-1"></i> Registry
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 5px;
      font-weight: bold;
    }
  `]
})
export class AppComponent {
  title = 'frontend';
}