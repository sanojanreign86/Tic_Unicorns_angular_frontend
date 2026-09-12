import { Component, OnInit } from '@angular/core';
import { Certificate } from '../../models/certificate-request.model';
import { CertificateService } from '../../services/certificate.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-certificate-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './certificate-list.html',
  styleUrl: './certificate-list.css'
})
export class CertificateList implements OnInit {

  goToRequestPage(): void {
    this.router.navigate(['/certificates/request']);
  }

  certificates: Certificate[] = [];

  isLoading = false;
  hasError = false;

  constructor(
    private certificateService: CertificateService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.isLoading = true;
    this.hasError = false;

    this.certificateService.getCertificates().subscribe({
      next: (data) => {
        this.certificates = data;
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'status-pending';

      case 'Processing':
        return 'status-processing';

      case 'Done':
        return 'status-done';

      case 'Rejected':
        return 'status-rejected';

      default:
        return '';
    }
  }
}