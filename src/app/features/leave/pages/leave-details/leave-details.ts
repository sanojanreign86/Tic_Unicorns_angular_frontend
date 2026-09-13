import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Leave } from '../../models/leave.model';
import { LeaveService } from '../../services/leave.service';

@Component({
  selector: 'app-leave-details',
  imports: [],
  templateUrl: './leave-details.html',
  styleUrl: './leave-details.css',
})
export class LeaveDetails implements OnInit {

  leave: Leave | null = null;
  leaveId: number | null = null;

  isLoading = false;
  isDeleting = false;

  errorMessage = '';

  constructor(
    private readonly leaveService: LeaveService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {

    const param =
      this.route.snapshot.paramMap.get('leaveId');

    const id = Number(param);

    if (!param || Number.isNaN(id) || id <= 0) {
      this.errorMessage = 'Invalid leave ID.';
      return;
    }

    this.leaveId = id;
    this.loadLeave();
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
          this.leave = leave;
          this.isLoading = false;
        },

        error: () => {
          this.errorMessage =
            'Unable to load leave request.';
          this.isLoading = false;
        }
      });
  }

  editLeave(): void {
    if (this.leaveId !== null) {
      this.router.navigate([
        '/leave/edit',
        this.leaveId
      ]);
    }
  }

  deleteLeave(): void {

    if (this.leaveId === null) {
      return;
    }

    if (
      !window.confirm(
        'Are you sure you want to delete this leave request?'
      )
    ) {
      return;
    }

    this.isDeleting = true;

    this.leaveService
      .deleteLeave(this.leaveId)
      .subscribe({
        next: () => {
          this.router.navigate(['/leave']);
        },

        error: () => {
          this.isDeleting = false;

          this.errorMessage =
            'Unable to delete leave request.';
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/leave']);
  }
}