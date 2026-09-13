import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IdentityService } from '../../services/identity.service';
import { StaffAssignment } from '../../models/staff-assignment.model';
import { StaffAssignmentFormComponent } from '../../components/staff-assignment-form/staff-assignment-form';

@Component({
  selector: 'app-staff-assignment',
  standalone: true,
  imports: [
    CommonModule,
    StaffAssignmentFormComponent
  ],
  templateUrl: './staff-assignment.html',
  styleUrl: './staff-assignment.css'
})
export class StaffAssignmentComponent {
  private readonly identityService = inject(IdentityService);

  protected isSaving = false;
  protected showForm = false;
  protected errorMessage = '';
  protected successMessage = '';

  protected openForm(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.showForm = true;
  }

  protected closeForm(): void {
    if (this.isSaving) {
      return;
    }

    this.showForm = false;
  }

  protected assignStaff(request: StaffAssignment): void {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.identityService.assignStaffScope(request).subscribe({
      next: () => {
        this.isSaving = false;
        this.showForm = false;
        this.successMessage =
          'Staff assignment request submitted successfully.';
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage =
          error?.error?.message ||
          'Unable to assign staff. Please try again.';
      }
    });
  }
}