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

  // 1. استخراج الداتا من الـ Signal
  const currentData = this.student();

  // 2. فرمتة الداتا (إجبار كل الحقول إنها تكون Strings صريحة ومفيش حاجة null)
  const payload: StudentData = {
    student_name: String(currentData.student_name || '').trim(),
    faculty: String(currentData.faculty || '').trim(),
    grade: String(currentData.grade || '').trim(),
    graduation_year: String(currentData.graduation_year || '').trim()
  };

  console.log("🚀 Payload being sent to FastAPI:", payload);

  // 3. إرسال الطلب
  this.certService.issueCertificate(payload).subscribe({
    next: (res) => {
      this.certService.downloadPdfFromBase64(res.pdf_base64, res.file_name);
      alert('تم إصدار الشهادة بنجاح! ✅');
      this.isLoading.set(false);
      
      // تفريغ الفورم بعد النجاح (اختياري)
      this.student.set({ student_name: '', faculty: 'Engineering - Shoubra', grade: 'Excellent', graduation_year: '' });
    },
    error: (err) => {
      console.error("❌ Full Error Object:", err);
      
      // هنا هنصطاد رسالة الـ FastAPI ونعرضها عشان نعرف إيه اللي مضايقه
      if (err.error && err.error.detail) {
        console.error("⚠️ FastAPI Validation Error:", err.error.detail);
        alert("خطأ في البيانات المبعوتة! افتح الـ Console (F12) عشان تشوف التفاصيل.");
      } else {
        alert('فشل في الاتصال بالسيرفر ❌');
      }
      this.isLoading.set(false);
    }
  });
}
}