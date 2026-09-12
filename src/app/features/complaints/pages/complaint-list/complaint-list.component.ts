import { Component } from '@angular/core';
import { Complaint } from '../../models/complaint.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-complaint-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './complaint-list.component.html',
  styleUrl: './complaint-list.component.css'
})
export class ComplaintListComponent {
  complaints: Complaint[] = [];

  isLoading = false;
  errorMessage = '';

  selectedStatus = 'All';

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
}