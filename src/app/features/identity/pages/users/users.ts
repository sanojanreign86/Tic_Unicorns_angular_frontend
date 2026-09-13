import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IdentityService } from '../../services/identity.service';
import { User } from '../../models/user.model';
import { UserTableComponent } from '../../components/user-table/user-table';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    UserTableComponent
  ],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class UsersComponent implements OnInit {
  private readonly identityService = inject(IdentityService);

  protected users: User[] = [];
  protected isLoading = false;
  protected errorMessage = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.identityService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error?.error?.message ||
          'Unable to load users. Please try again.';
      }
    });
  }

  protected retry(): void {
    this.loadUsers();
  }
}