import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { Certificate } from '../../models/certificate-request.model';
import { CertificateService } from '../../services/certificate.service';

@Component({
  selector: 'app-certificate-details',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './certificate-details.html',
  styleUrl: './certificate-details.css'
})
export class CertificateDetails implements OnInit {

  certificate?: Certificate;
  isLoading = false;
  hasError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private certificateService: CertificateService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.hasError = true;
      return;
    }

    this.loadCertificate(id);
  }

  loadCertificate(id: number): void {
    this.isLoading = true;
    this.hasError = false;

    this.certificateService
      .getCertificateById(id)
      .subscribe({
        next: (data) => {
          this.certificate = data;

          if (!data) {
            this.hasError = true;
          }

          this.isLoading = false;
        },
        error: () => {
          this.hasError = true;
          this.isLoading = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/certificates']);
  }

  editCertificate(): void {
    if (this.certificate) {
      this.router.navigate([
        '/certificates',
        this.certificate.certificateId,
        'edit'
      ]);
    }
  }

  deleteCertificate(): void {
    if (!this.certificate) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this certificate request?'
    );

    if (!confirmed) {
      return;
    }

    this.isLoading = true;

    this.certificateService
      .deleteCertificate(this.certificate.certificateId)
      .subscribe({
        next: (deleted) => {
          this.isLoading = false;

          if (deleted) {
            this.router.navigate(['/certificates']);
          } else {
            this.hasError = true;
          }
        },
        error: () => {
          this.isLoading = false;
          this.hasError = true;
        }
      });
  }
}