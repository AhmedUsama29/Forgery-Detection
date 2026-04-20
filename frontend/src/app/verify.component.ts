import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignatureService, StudentData } from './signature.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify.component.html',
})
export class VerifyComponent {
  activeTab: 'issue' | 'verify' = 'verify';

  student: StudentData = { student_name: '', faculty: 'Engineering', grade: 'Excellent', graduation_year: '2026' };
  issuing = false;

  verifyFile?: File;
  verifying = false;
  result: any = null;

  constructor(private svc: SignatureService) {}

issue() {
    if(!this.student.student_name) { alert("اكتب اسم الطالب الأول!"); return; }
    this.issuing = true;
    this.svc.issueCertificate(this.student).subscribe({
      next: (res) => {
        // بناء ملف الـ PDF من النص اللي راجع
        const linkSource = `data:application/pdf;base64,${res.pdf_base64}`;
        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.download = res.file_name;
        downloadLink.click(); // تحميل صامت بدون IDM

        this.issuing = false;
        alert('تم إصدار الشهادة وتحميلها بنجاح! ✅');
      },
      error: () => { alert('حصل مشكلة في الإصدار ❌'); this.issuing = false; }
    });
  }

  onFileSelect(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) { 
      this.verifyFile = file; 
      this.result = null;
    }
  }

  verify() {
    if (!this.verifyFile) return;
    this.verifying = true;
    this.result = null;
    this.svc.verify(this.verifyFile).subscribe({
      next: (res) => { this.result = res; this.verifying = false; },
      error: () => {
         this.result = { status: 'failed', message: 'فشل في الاتصال أو الملف تالف ❌' };
         this.verifying = false;
      }
    });
  }
}