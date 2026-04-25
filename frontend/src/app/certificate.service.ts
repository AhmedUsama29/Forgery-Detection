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

  issueCertificate(data: StudentData): Observable<any> {
    return this.http.post(`${this.apiUrl}/issue-certificate`, data);
  }

  verifyCertificate(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/verify`, formData);
  }

  // Bypasses IDM by triggering a silent anchor download
  downloadPdfFromBase64(base64String: string, fileName: string) {
    const linkSource = `data:application/pdf;base64,${base64String}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
    downloadLink.remove();
  }

  // جلب كل الشهادات
getCertificates(): Observable<CertificateRecord[]> {
  return this.http.get<CertificateRecord[]>(`${this.apiUrl}/certificates`);
}

// جلب شهادة واحدة بالـ ID
getCertificateById(docId: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/certificates/${docId}`);
}

// مسح شهادة (إلغاء)
deleteCertificate(docId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/certificates/${docId}`);
}

}