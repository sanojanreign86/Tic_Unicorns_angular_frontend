import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ComplaintService } from '../../services/complaint.service';
import { ComplaintCategory } from '../../models/complaint-category.model';

@Component({
  selector: 'app-create-complaint',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-complaint.html',
  styleUrl: './create-complaint.css'
})
export class CreateComplaint {
  private readonly fb = inject(FormBuilder);
  private readonly complaintService = inject(ComplaintService);
  private readonly router = inject(Router);

  categories: ComplaintCategory[] = [];

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  complaintForm = this.fb.group({
    categoryId: [0, [Validators.required, Validators.min(1)]],
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]]
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.complaintService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.filter(category => category.isActive);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load complaint categories.';
        this.isLoading = false;
      }
    });
  }

  submitComplaint(): void {
    if (this.complaintForm.invalid) {
      this.complaintForm.markAllAsTouched();
      return;
    }

    const studentId = 1;

    const request = {
      categoryId: Number(this.complaintForm.value.categoryId),
      studentId,
      title: this.complaintForm.value.title!.trim(),
      description: this.complaintForm.value.description!.trim()
    };

    this.isSubmitting = true;
    this.errorMessage = '';

    this.complaintService.createComplaint(request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Complaint submitted successfully.';

        setTimeout(() => {
          this.router.navigate(['/complaints']);
        }, 1000);
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Unable to submit complaint. Please try again.';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/complaints']);
  }
}