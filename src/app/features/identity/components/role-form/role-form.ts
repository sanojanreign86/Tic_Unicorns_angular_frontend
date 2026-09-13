import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  CreateRoleRequest,
  Role,
  UpdateRoleRequest
} from '../../models/role.model';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './role-form.html',
  styleUrl: './role-form.css'
})
export class RoleFormComponent {
  private readonly fb = inject(FormBuilder);

  @Input() role: Role | null = null;
  @Input() isLoading = false;

  @Output() formSubmit = new EventEmitter<
    CreateRoleRequest | UpdateRoleRequest
  >();

  @Output() cancel = new EventEmitter<void>();

  protected readonly roleForm = this.fb.nonNullable.group({
    roleName: ['', Validators.required],
    description: [''],
    isActive: [true]
  });

  ngOnInit(): void {
    if (this.role) {
      this.roleForm.patchValue({
        roleName: this.role.roleName,
        description: this.role.description ?? '',
        isActive: this.role.isActive
      });
    }
  }

  protected submit(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    const formValue = this.roleForm.getRawValue();

    if (this.role) {
      const request: UpdateRoleRequest = {
        roleName: formValue.roleName,
        description: formValue.description || null,
        isActive: formValue.isActive
      };

      this.formSubmit.emit(request);
      return;
    }

    const request: CreateRoleRequest = {
      roleName: formValue.roleName,
      description: formValue.description || null
    };

    this.formSubmit.emit(request);
  }

  protected close(): void {
    this.cancel.emit();
  }
}