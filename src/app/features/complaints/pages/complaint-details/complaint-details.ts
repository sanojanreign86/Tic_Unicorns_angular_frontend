import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ComplaintService } from '../../services/complaint.service';
import { Complaint } from '../../models/complaint.model';

@Component({
  selector: 'app-complaint-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './complaint-details.html',
  styleUrl: './complaint-details.css'
})
export class ComplaintDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly complaintService = inject(ComplaintService);

  complaint: Complaint | null = null;
  history: any[] = [];

  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Invalid complaint ID.';
      this.isLoading = false;
      return;
    }

    this.loadComplaint(id);
    this.loadHistory(id);
  }

  private loadComplaint(id: number): void {
    this.complaintService.getComplaintById(id).subscribe({
      next: (complaint) => {
        this.complaint = complaint;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load complaint details.';
        this.isLoading = false;
      }
    });
  }

  private loadHistory(id: number): void {
    this.complaintService.getComplaintHistory(id).subscribe({
      next: (history) => {
        this.history = history;
      },
      error: () => {
        this.history = [];
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/complaints']);
  }
}