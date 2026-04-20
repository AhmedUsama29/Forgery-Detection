import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentData {
  student_name: string;
  faculty: string;
  grade: string;
  graduation_year: string;
}

@Injectable({ providedIn: 'root' })
export class SignatureService {
  private API = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  // دالة إصدار الشهادة (بترجع ملف Blob عشان نحمله)
issueCertificate(data: StudentData): Observable<any> {
    // شيلنا الـ { responseType: 'blob' } عشان هنستقبل JSON
    return this.http.post(`${this.API}/issue-certificate`, data);
  }

  // دالة التحقق (بتبعت ملف PDF واحد)
  verify(pdfFile: File): Observable<any> {
    const fd = new FormData();
    fd.append('file', pdfFile);
    return this.http.post<any>(`${this.API}/verify`, fd);
  }
}