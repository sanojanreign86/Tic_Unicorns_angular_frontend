import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CertificateService } from '../../services/certificate.service';

@Component({
  selector: 'app-certificate-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './certificate-edit.html',
  styleUrl: './certificate-edit.css'
})
export class CertificateEdit implements OnInit {
  certificateForm!: FormGroup;

  certificateId!: number;
  isLoading = false;
  isSaving = false;
  hasError = false;
  submitSuccess = false;
  submitError = false;

  certificateTypes = [
    'Bonafide',
    'CourseCompletion',
    'Character',
    'Transcript',
    'Other'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private certificateService: CertificateService
  ) {
    this.certificateForm = this.formBuilder.group({
      certificateType: ['', Validators.required],
      purpose: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.certificateId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!this.certificateId) {
      this.hasError = true;
      return;
    }

    this.loadCertificate();
  }

  loadCertificate(): void {
    this.isLoading = true;
    this.hasError = false;

    this.certificateService
      .getCertificateById(this.certificateId)
      .subscribe({
        next: (certificate) => {
          if (!certificate) {
            this.hasError = true;
            this.isLoading = false;
            return;
          }

          this.certificateForm.patchValue({
            certificateType: certificate.certificateType,
            purpose: certificate.purpose
          });

          this.isLoading = false;
        },
        error: () => {
          this.hasError = true;
          this.isLoading = false;
        }
      });
  }

  submitUpdate(): void {
    this.submitSuccess = false;
    this.submitError = false;

    if (this.certificateForm.invalid) {
      this.certificateForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const request = {
      certificateType:
        this.certificateForm.value.certificateType ?? '',
      purpose:
        this.certificateForm.value.purpose ?? ''
    };

    this.certificateService
      .updateCertificate(this.certificateId, request)
      .subscribe({
        next: (certificate) => {
          this.isSaving = false;

          if (!certificate) {
            this.submitError = true;
            return;
          }

          this.submitSuccess = true;
        },
        error: () => {
          this.isSaving = false;
          this.submitError = true;
        }
      });
  }

  cancel(): void {
    this.router.navigate([
      '/certificates',
      this.certificateId
    ]);
  }

  get certificateType() {
    return this.certificateForm.controls['certificateType'];
  }

  get purpose() {
    return this.certificateForm.controls['purpose'];
  }
}