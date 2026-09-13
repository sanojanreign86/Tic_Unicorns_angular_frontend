import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Permission } from '../../models/permission.model';

@Component({
  selector: 'app-permission-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permission-table.html',
  styleUrl: './permission-table.css'
})
export class PermissionTableComponent {
  @Input() permissions: Permission[] = [];
  @Input() isLoading = false;
}