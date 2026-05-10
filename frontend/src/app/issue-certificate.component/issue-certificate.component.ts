import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertificateService, StudentData } from '../certificate.service';

@Component({
  selector: 'app-issue-certificate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './issue-certificate.component.html',
  styleUrls: ['./issue-certificate.component.css']
})
export class IssueCertificateComponent {
  private certService = inject(CertificateService);

  student = signal<StudentData>({
    student_name: '',
    faculty: 'Engineering - Shoubra',
    grade: 'Excellent',
    graduation_year: new Date().getFullYear().toString()
  });

  isLoading = signal<boolean>(false);
  successMessage = signal<string>('');

  issueDocument() {
    this.isLoading.set(true);

    // 1. Extract data from the Signal
    const currentData = this.student();

    // 2. Format the data (force all fields to be explicit strings with no null values)
    const payload: StudentData = {
      student_name: String(currentData.student_name || '').trim(),
      faculty: String(currentData.faculty || '').trim(),
      grade: String(currentData.grade || '').trim(),
      graduation_year: String(currentData.graduation_year || '').trim()
    };

    console.log("🚀 Payload being sent to FastAPI:", payload);

    // 3. Send the request
    this.certService.issueCertificate(payload).subscribe({
      next: (res) => {
        this.certService.downloadPdfFromBase64(res.pdf_base64, res.file_name);
        alert('Certificate issued successfully! ✅');
        this.isLoading.set(false);
        
        // Clear the form after success (optional)
        this.student.set({ 
          student_name: '', 
          faculty: 'Engineering - Shoubra', 
          grade: 'Excellent', 
          graduation_year: '' 
        });
      },
      error: (err) => {
        console.error("❌ Full Error Object:", err);
        
        // Catch the FastAPI message and display it to understand what's wrong
        if (err.error && err.error.detail) {
          console.error("⚠️ FastAPI Validation Error:", err.error.detail);
          alert("Error in the sent data! Open the Console (F12) to see the details.");
        } else {
          alert('Failed to connect to the server ❌');
        }
        this.isLoading.set(false);
      }
    });
  }
}