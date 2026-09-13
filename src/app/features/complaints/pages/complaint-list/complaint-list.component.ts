import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Complaint } from '../../models/complaint.model';
import { ComplaintService } from '../../services/complaint.service';

@Component({
  selector: 'app-complaint-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './complaint-list.component.html',
  styleUrl: './complaint-list.component.css'
})
export class ComplaintListComponent implements OnInit {
  private readonly complaintService = inject(ComplaintService);
  private readonly router = inject(Router);

  complaints: Complaint[] = [];

  isLoading = false;
  errorMessage = '';

  selectedStatus = 'All';

  ngOnInit(): void {
    this.loadComplaints();
  }

  private loadComplaints(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.complaintService.getMyComplaints().subscribe({
      next: (complaints) => {
        this.complaints = complaints;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load complaints. Please try again.';
        this.isLoading = false;
      }
    });
  }

  get filteredComplaints(): Complaint[] {
    if (this.selectedStatus === 'All') {
      return this.complaints;
    }

    return this.complaints.filter(
      complaint => complaint.status === this.selectedStatus
    );
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
  }

  viewComplaint(id: number): void {
    this.router.navigate(['/complaints', id]);
  }

  createComplaint(): void {
    this.router.navigate(['/complaints/create']);
  }
}