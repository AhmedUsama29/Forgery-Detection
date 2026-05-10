import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentData {
  student_name: string;
  faculty: string;
  grade: string;
  graduation_year: string;
}

export interface CertificateRecord {
  id: number;           // المعرف التلقائي للداتابيز
  doc_id: string;       // المعرف الفريد للشهادة (UUID)
  student_name: string;
  faculty: string;
  grade: string;
  graduation_year: string;
  issued_at: string;
  sha256_hash: string;
  certificate_json: string; // البيانات الكاملة مخزنة كنص
}

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000';

  // إصدار شهادة جديدة
  issueCertificate(data: StudentData): Observable<any> {
    return this.http.post(`${this.apiUrl}/issue-certificate`, data);
  }

  // التحقق من صحة الشهادة
  verifyCertificate(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/verify`, formData);
  }

  // تحميل PDF من Base64 (للشهادة الصادرة حديثاً)
  downloadPdfFromBase64(base64String: string, fileName: string) {
    const linkSource = `data:application/pdf;base64,${base64String}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
    downloadLink.remove();
  }

  // ✅ عرض PDF من Base64 في نافذة جديدة
  viewPdfFromBase64(base64String: string) {
    const linkSource = `data:application/pdf;base64,${base64String}`;
    window.open(linkSource, '_blank');
  }

  // جلب كل الشهادات
  getCertificates(): Observable<CertificateRecord[]> {
    return this.http.get<CertificateRecord[]>(`${this.apiUrl}/certificates`);
  }

  // جلب شهادة واحدة بالـ ID (بيانات JSON)
  getCertificateById(docId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/certificates/${docId}`);
  }

  // ✅ جلب ملف PDF للشهادة (لعرضه في نافذة جديدة)
  getCertificatePDF(docId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/certificates/${docId}/pdf`, {
      responseType: 'blob'
    });
  }

  // مسح شهادة (إلغاء)
  deleteCertificate(docId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/certificates/${docId}`);
  }
}