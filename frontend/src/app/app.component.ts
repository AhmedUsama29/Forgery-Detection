import { Component } from '@angular/core';
import { VerifyComponent } from './verify.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [VerifyComponent],
  template: `<app-verify></app-verify>`,
})
export class AppComponent {
  title = 'frontend';
}