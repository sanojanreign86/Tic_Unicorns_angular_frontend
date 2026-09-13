import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Leave } from '../../models/leave.model';
import { LeaveService } from '../../services/leave.service';

@Component({
  selector: 'app-leave-list',
  imports: [],
  templateUrl: './leave-list.html',
  styleUrl: './leave-list.css',
})
export class LeaveList implements OnInit {
  leaves: Leave[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly leaveService: LeaveService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadLeaves();
  }

  loadLeaves(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.leaveService.getAllLeaves().subscribe({
      next: (leaves: Leave[]) => {
        this.leaves = leaves;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage =
          'Unable to load leave requests. Please try again.';
        this.isLoading = false;
      }
    });
  }

  addLeave(): void {
    this.router.navigate(['/leave/create']);
  }

  viewLeave(leaveId: number): void {
    this.router.navigate(['/leave', leaveId]);
  }

  editLeave(leaveId: number): void {
    this.router.navigate(['/leave/edit', leaveId]);
  }
}