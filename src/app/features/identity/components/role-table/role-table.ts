import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Role } from '../../models/role.model';

@Component({
  selector: 'app-role-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-table.html',
  styleUrl: './role-table.css'
})
export class RoleTableComponent {
  @Input() roles: Role[] = [];
  @Input() isLoading = false;

  @Output() editRole = new EventEmitter<Role>();

  protected onEdit(role: Role): void {
    this.editRole.emit(role);
  }
}