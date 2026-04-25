import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificateService, CertificateRecord } from '../certificate.service';

@Component({
  selector: 'app-certificate-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate-list.component.html'
})
export class CertificateListComponent implements OnInit {
  private certService = inject(CertificateService);
  
  certificates = signal<CertificateRecord[]>([]);
  isLoading = signal<boolean>(false);
  selectedCert = signal<any>(null); // لتخزين الشهادة المراد عرض تفاصيلها

  ngOnInit() {
    this.loadCertificates();
  }

  loadCertificates() {
    this.isLoading.set(true);
    this.certService.getCertificates().subscribe({
      next: (data) => {
        this.certificates.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.isLoading.set(false);
      }
    });
  }

  deleteCert(id: string) {
    if (!id) {
      alert("Error: Missing Document ID");
      return;
    }
    
    if (confirm('هل أنت متأكد من إلغاء هذه الشهادة؟ لا يمكن التراجع عن هذا الإجراء.')) {
      this.certService.deleteCertificate(id).subscribe({
        next: () => {
          this.certificates.update(list => list.filter(c => c.doc_id !== id));
          alert('تم إلغاء الشهادة بنجاح ✅');
        },
        error: (err) => {
          console.error('Delete error:', err);
          alert('فشل في إلغاء الشهادة ❌');
        }
      });
    }
  }

  viewDetails(id: string) {
    this.certService.getCertificateById(id).subscribe({
      next: (res) => {
        // فك تشفير الـ JSON المخزن لعرضه بشكل جميل
        this.selectedCert.set(res);
        // يمكنك هنا استخدام Bootstrap Modal برمجياً أو عرضه في الـ HTML
      },
      error: (err) => alert('فشل في جلب التفاصيل ❌')
    });
  }
}