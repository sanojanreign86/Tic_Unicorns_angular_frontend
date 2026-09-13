import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-table.html',
  styleUrl: './user-table.css'
})
export class UserTableComponent {
  @Input() users: User[] = [];
  @Input() isLoading = false;
}