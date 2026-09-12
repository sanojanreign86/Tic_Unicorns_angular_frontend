import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { CertificateService } from '../../services/certificate.service';

@Component({
  selector: 'app-certificate-request',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './certificate-request.html',
  styleUrl: './certificate-request.css'
})
export class CertificateRequest {

  // Temporary value for UI development.
  // This will come from the logged-in student after Auth/Core integration.
  private readonly studentId = 1001;

  certificateForm!: FormGroup;

  isSubmitting = false;
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
    private certificateService: CertificateService,
    private router: Router
  ) {
    this.certificateForm = this.formBuilder.group({
      certificateType: ['', Validators.required],
      purpose: [
        '',
        [
          Validators.required,
          Validators.maxLength(500)
        ]
      ]
    });
  }

  submitRequest(): void {
    this.submitSuccess = false;
    this.submitError = false;

    if (this.certificateForm.invalid) {
      this.certificateForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const request = {
      studentId: this.studentId,
      certificateType:
        this.certificateForm.value.certificateType ?? '',
      purpose:
        this.certificateForm.value.purpose ?? ''
    };

    this.certificateService.createCertificate(request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.certificateForm.reset();
      },
      error: () => {
        this.isSubmitting = false;
        this.submitError = true;
      }
    });
  }

  cancel(): void {
    this.certificateForm.reset();
    this.submitSuccess = false;
    this.submitError = false;

    this.router.navigate(['/certificates']);
  }

  get certificateType() {
    return this.certificateForm.controls['certificateType'];
  }

  get purpose() {
    return this.certificateForm.controls['purpose'];
  }
}