import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { StaffAssignment } from '../../models/staff-assignment.model';

@Component({
  selector: 'app-staff-assignment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './staff-assignment-form.html',
  styleUrl: './staff-assignment-form.css'
})
export class StaffAssignmentFormComponent {
  private readonly fb = inject(FormBuilder);

  @Output() formSubmit = new EventEmitter<StaffAssignment>();
  @Output() cancel = new EventEmitter<void>();

  protected readonly assignmentForm = this.fb.nonNullable.group({
    userId: [
      0,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],
    scopeType: [
      'department',
      Validators.required
    ],
    scopeId: [
      0,
      [
        Validators.required,
        Validators.min(1)
      ]
    ]
  });

  @Input() isLoading = false;

  protected submit(): void {
    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    const formValue = this.assignmentForm.getRawValue();

    const assignment: StaffAssignment = {
      userId: formValue.userId,
      departmentId:
        formValue.scopeType === 'department'
          ? formValue.scopeId
          : null,
      hostelId:
        formValue.scopeType === 'hostel'
          ? formValue.scopeId
          : null,
      canteenId:
        formValue.scopeType === 'canteen'
          ? formValue.scopeId
          : null
    };

    this.formSubmit.emit(assignment);
  }

  protected close(): void {
    this.cancel.emit();
  }
}