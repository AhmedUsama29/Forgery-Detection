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
  isGeneratingPDF = signal<boolean>(false);
  selectedCert = signal<any>(null);

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
        alert('Failed to load certificates ❌');
      }
    });
  }

  deleteCert(id: string) {
    if (!id) {
      alert("Error: Missing Document ID");
      return;
    }
    
    if (confirm('Are you sure you want to revoke this certificate? This action cannot be undone.')) {
      this.certService.deleteCertificate(id).subscribe({
        next: () => {
          this.certificates.update(list => list.filter(c => c.doc_id !== id));
          alert('Certificate revoked successfully ✅');
        },
        error: (err) => {
          console.error('Delete error:', err);
          alert('Failed to revoke certificate ❌');
        }
      });
    }
  }

  // View PDF certificate (opens in new tab)
  viewCertificate(certificate: CertificateRecord) {
    this.isGeneratingPDF.set(true);
    
    this.certService.getCertificatePDF(certificate.doc_id).subscribe({
      next: (pdfBlob: Blob) => {
        const url = window.URL.createObjectURL(pdfBlob);
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
        this.isGeneratingPDF.set(false);
      },
      error: (err) => {
        console.error('PDF fetch error:', err);
        alert('Failed to display PDF certificate ❌');
        this.isGeneratingPDF.set(false);
      }
    });
  }

  // Download PDF certificate (saves to device)
  downloadCertificate(certificate: CertificateRecord) {
    this.isGeneratingPDF.set(true);
    
    this.certService.getCertificatePDF(certificate.doc_id).subscribe({
      next: (blob: Blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // File name: Certificate_Student_Name.pdf
        link.download = `Certificate_${certificate.student_name.replace(/\s/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.isGeneratingPDF.set(false);
        alert('Certificate downloaded successfully ✅');
      },
      error: (err) => {
        console.error('Download error:', err);
        alert('Failed to download certificate ❌');
        this.isGeneratingPDF.set(false);
      }
    });
  }

  // View certificate details
  viewDetails(id: string) {
    this.certService.getCertificateById(id).subscribe({
      next: (res) => {
        this.selectedCert.set(res);
      },
      error: (err) => {
        console.error('Details error:', err);
        alert('Failed to fetch details ❌');
      }
    });
  }
}