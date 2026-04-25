import { Routes } from '@angular/router';
import { IssueCertificateComponent } from './issue-certificate.component/issue-certificate.component';
import { VerifyCertificateComponent } from './verify-certificate.component/verify-certificate.component';
import { CertificateListComponent } from './certificate-list.component/certificate-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'issue', pathMatch: 'full' },
  { path: 'issue', component: IssueCertificateComponent },
  { path: 'verify', component: VerifyCertificateComponent },
  { path: 'manage', component: CertificateListComponent }
];