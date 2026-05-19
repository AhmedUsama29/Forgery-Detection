import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificateService } from '../certificate.service';

@Component({
  selector: 'app-verify-certificate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-certificate.component.html',
  styleUrls: ['./verify-certificate.component.css']
})
export class VerifyCertificateComponent {
  private certService = inject(CertificateService);

  selectedFile = signal<File | null>(null);
  isLoading = signal<boolean>(false);
  verificationResult = signal<any>(null);

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile.set(file);
      this.verificationResult.set(null);
    } else {
      alert('Please upload a valid PDF file.');
    }
  }

  verifyDocument() {
    const file = this.selectedFile();
    if (!file) return;

    this.isLoading.set(true);
    this.certService.verifyCertificate(file).subscribe({
      next: (res) => {
        this.verificationResult.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.verificationResult.set({ status: 'error', message: 'Verification API failed.' });
        this.isLoading.set(false);
      }
    });
  }
}