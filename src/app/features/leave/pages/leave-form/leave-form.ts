import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CreateLeaveRequest,
  Leave,
  LeaveStatus,
  UpdateLeaveRequest
} from '../../models/leave.model';

import { LeaveService } from '../../services/leave.service';

@Component({
  selector: 'app-leave-form',
  imports: [ReactiveFormsModule],
  templateUrl: './leave-form.html',
  styleUrl: './leave-form.css',
})
export class LeaveForm implements OnInit {

  leaveId: number | null = null;

  isEditMode = false;
  isLoading = false;
  isSubmitting = false;

  errorMessage = '';
  successMessage = '';

  readonly statuses: LeaveStatus[] = [
    'Pending',
    'Approved',
    'Rejected',
    'Cancelled'
  ];

  leaveForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly leaveService: LeaveService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.leaveForm = this.formBuilder.nonNullable.group({
      userId: [
        1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      leaveType: [
        '',
        Validators.required
      ],

      startDate: [
        '',
        Validators.required
      ],

      endDate: [
        '',
        Validators.required
      ],

      reason: [
        '',
        Validators.required
      ],

      status: [
        'Pending' as LeaveStatus,
        Validators.required
      ]
    });
  }

  ngOnInit(): void {
    const param =
      this.route.snapshot.paramMap.get('leaveId');

    if (param) {
      const id = Number(param);

      if (!Number.isNaN(id) && id > 0) {
        this.leaveId = id;
        this.isEditMode = true;
        this.loadLeave();
      }
    }
  }

  loadLeave(): void {
    if (this.leaveId === null) {
      return;
    }

    this.isLoading = true;

    this.leaveService
      .getLeaveById(this.leaveId)
      .subscribe({
        next: (leave: Leave) => {

          this.leaveForm.patchValue({
            userId: leave.userId,
            leaveType: leave.leaveType,
            startDate: leave.startDate.substring(0, 10),
            endDate: leave.endDate.substring(0, 10),
            reason: leave.reason,
            status: leave.status
          });

          this.isLoading = false;
        },

        error: () => {
          this.errorMessage =
            'Unable to load leave request.';

          this.isLoading = false;
        }
      });
  }

  saveLeave(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }

    const value =
      this.leaveForm.getRawValue();

    if (value.endDate < value.startDate) {
      this.errorMessage =
        'End date cannot be before start date.';
      return;
    }

    this.isSubmitting = true;

    if (
      this.isEditMode &&
      this.leaveId !== null
    ) {

      const request: UpdateLeaveRequest = {
        leaveType: value.leaveType,
        startDate: value.startDate,
        endDate: value.endDate,
        reason: value.reason,
        status: value.status
      };

      this.leaveService
        .updateLeave(this.leaveId, request)
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.successMessage =
              'Leave updated successfully.';
          },

          error: () => {
            this.isSubmitting = false;
            this.errorMessage =
              'Unable to update leave.';
          }
        });

    } else {

      const request: CreateLeaveRequest = {
        userId: value.userId,
        leaveType: value.leaveType,
        startDate: value.startDate,
        endDate: value.endDate,
        reason: value.reason
      };

      this.leaveService
        .createLeave(request)
        .subscribe({
          next: () => {
            this.isSubmitting = false;

            this.successMessage =
              'Leave request created successfully.';

            this.leaveForm.reset({
              userId: 1,
              leaveType: '',
              startDate: '',
              endDate: '',
              reason: '',
              status: 'Pending'
            });
          },

          error: () => {
            this.isSubmitting = false;
            this.errorMessage =
              'Unable to create leave request.';
          }
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/leave']);
  }
}