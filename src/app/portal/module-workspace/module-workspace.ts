import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon';
import { StudentEventsComponent } from '../student-experience/student-events';
import { StudentLabsComponent } from '../student-experience/student-labs';
import { StudentHostelsComponent } from '../student-experience/student-hostels';
import { StudentCanteenComponent } from '../student-experience/student-canteen';
import { StudentCertificatesComponent } from '../student-experience/student-certificates';
import { StudentComplaintsComponent } from '../student-experience/student-complaints';
import { StudentNotificationsComponent } from '../student-experience/student-notifications';
import { StudentFeesComponent } from '../student-experience/student-fees';
import { StudentGymComponent } from '../student-experience/student-gym';
import { StudentLeaveComponent } from '../student-experience/student-leave';
import { StudentSportsComponent } from '../student-experience/student-sports';
import { AdminEventsComponent } from '../admin-experience/admin-events/admin-events';
import { AdminLabsComponent } from '../admin-experience/admin-labs/admin-labs';
import { AdminHostelsComponent } from '../admin-experience/admin-hostels/admin-hostels';
import { AdminStudentsComponent } from '../admin-experience/admin-students/admin-students';
import { AdminCanteenComponent } from '../admin-experience/admin-canteen/admin-canteen';
import { AdminSportsComponent } from '../admin-experience/admin-sports/admin-sports';
import { AdminSystemSettingsComponent } from '../admin-experience/admin-system-settings/admin-system-settings';
import { AdminGymComponent } from '../admin-experience/admin-gym/admin-gym';
import { AdminCertificatesComponent } from '../admin-experience/admin-certificates/admin-certificates';
import { AdminComplaintsComponent } from '../admin-experience/admin-complaints/admin-complaints';
import { AdminLeaveComponent } from '../admin-experience/admin-leave/admin-leave';

import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import {
  ActionConfig,
  ActionFieldConfig,
  PortalModuleConfig,
  ResourceConfig,
  getPortalModule,
  roleCanAccess
} from '../../core/config/portal-modules';

@Component({
  selector: 'app-module-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent, StudentEventsComponent, StudentLabsComponent, StudentHostelsComponent, StudentCanteenComponent, StudentCertificatesComponent, StudentComplaintsComponent, StudentNotificationsComponent, StudentFeesComponent, StudentGymComponent, StudentLeaveComponent, StudentSportsComponent, AdminEventsComponent, AdminLabsComponent, AdminHostelsComponent, AdminStudentsComponent, AdminCanteenComponent, AdminSportsComponent, AdminSystemSettingsComponent, AdminGymComponent, AdminCertificatesComponent, AdminComplaintsComponent, AdminLeaveComponent],
  templateUrl: './module-workspace.html',
  styleUrl: './module-workspace.css'
})
export class ModuleWorkspaceComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly auth = inject(AuthService);
  private readonly subscriptions = new Subscription();

  config?: PortalModuleConfig;
  moduleKey = '';
  resources: ResourceConfig[] = [];
  actions: ActionConfig[] = [];
  activeResource?: ResourceConfig;
  rows: Record<string, unknown>[] = [];
  filteredRows: Record<string, unknown>[] = [];
  columns: string[] = [];
  searchTerm = '';
  isLoading = false;
  loadError = '';
  lastUpdated = '';

  selectedAction?: ActionConfig;
  actionValues: Record<string, string | number | boolean | null> = {};
  actionOptions: Record<string, { value: string | number; label: string }[]> = {};
  actionError = '';
  actionSuccess = '';
  isSubmitting = false;

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.data.subscribe((data) => {
        const key = String(data['moduleKey'] ?? '');
        this.moduleKey = key;
        const config = getPortalModule(key);
        this.config = config;
        this.configureForRole();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private configureForRole(): void {
    if (!this.config) return;
    if (this.moduleKey === 'notifications') {
      this.resources = [];
      this.actions = [];
      this.activeResource = undefined;
      return;
    }
    if (this.auth.isStudent() && ['events','labs','hostels','canteen','certificates','complaints','fees','gym','leave','sports'].includes(this.moduleKey)) {
      this.resources = [];
      this.actions = [];
      this.activeResource = undefined;
      return;
    }
    if (this.auth.isAdmin() && ['events','labs','hostels','students','canteen','sports','system-settings','gym','certificates','complaints','leave'].includes(this.moduleKey)) {
      this.resources = [];
      this.actions = [];
      this.activeResource = undefined;
      return;
    }
    const role = this.auth.getRole();
    this.resources = this.config.resources.filter((item) => roleCanAccess(item.roles, role));
    this.actions = this.config.actions.filter((item) => roleCanAccess(item.roles, role));
    this.activeResource = this.resources[0];
    if (this.activeResource) this.loadResource(this.activeResource);
  }

  loadResource(resource: ResourceConfig): void {
    this.activeResource = resource;
    this.isLoading = true;
    this.loadError = '';
    this.rows = [];
    this.filteredRows = [];
    this.columns = [];

    this.api.get<unknown>(resource.endpoint).pipe(
      finalize(() => {
        this.isLoading = false;
        // Angular 21 is zoneless by default. Notify Angular that async HTTP state changed.
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response) => {
        this.rows = this.normalizeRows(response);
        this.columns = this.resolveColumns(this.rows);
        this.applySearch();
        this.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      },
      error: (error) => {
        this.loadError = error?.error?.message ?? error?.error ?? 'Unable to load this information right now.';
      }
    });
  }

  refresh(): void {
    if (this.activeResource) this.loadResource(this.activeResource);
  }

  applySearch(): void {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) {
      this.filteredRows = [...this.rows];
      return;
    }
    this.filteredRows = this.rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query));
  }

  openAction(action: ActionConfig): void {
    this.selectedAction = action;
    this.actionError = '';
    this.actionSuccess = '';
    this.actionValues = {};
    this.actionOptions = {};
    for (const field of action.fields ?? []) {
      this.actionValues[field.key] = field.type === 'boolean' ? true : '';
      if (field.options?.length) this.actionOptions[field.key] = field.options;
      if (field.optionsEndpoint) this.loadActionOptions(field);
    }
  }

  private loadActionOptions(field: ActionFieldConfig): void {
    if (!field.optionsEndpoint) return;
    this.api.get<unknown>(field.optionsEndpoint).subscribe({
      next: (response) => {
        const rows = this.normalizeRows(response);
        const valueKey = field.optionValueKey ?? 'id';
        const labelKey = field.optionLabelKey ?? 'name';
        this.actionOptions[field.key] = rows
          .filter((row) => row[valueKey] !== undefined && row[labelKey] !== undefined)
          .map((row) => ({ value: row[valueKey] as string | number, label: String(row[labelKey]) }));
        this.cdr.markForCheck();
      },
      error: () => {
        this.actionOptions[field.key] = [];
        this.cdr.markForCheck();
      }
    });
  }

  closeAction(): void {
    if (this.isSubmitting) return;
    this.selectedAction = undefined;
    this.actionError = '';
    this.actionSuccess = '';
  }

  submitAction(): void {
    const action = this.selectedAction;
    if (!action) return;

    for (const field of action.fields ?? []) {
      const value = this.actionValues[field.key];
      if (field.required && (value === '' || value === null || value === undefined)) {
        this.actionError = `${field.label} is required.`;
        return;
      }
    }

    const endpoint = this.buildEndpoint(action);
    const body = this.buildBody(action.fields ?? []);
    this.isSubmitting = true;
    this.actionError = '';
    this.actionSuccess = '';

    const request = action.method === 'POST'
      ? this.api.post<unknown>(endpoint, body)
      : action.method === 'PUT'
        ? this.api.put<unknown>(endpoint, body)
        : action.method === 'PATCH'
          ? this.api.patch<unknown>(endpoint, body)
          : this.api.delete<unknown>(endpoint);

    request.pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.actionSuccess = action.successMessage;
        this.refreshAfterAction(action);
      },
      error: (error) => {
        this.actionError = error?.error?.message ?? error?.error ?? 'This action could not be completed.';
      }
    });
  }


  private refreshAfterAction(action: ActionConfig): void {
    if (!this.resources.length) {
      this.cdr.markForCheck();
      return;
    }

    // After creating/updating a record, open the resource that best matches
    // that endpoint so the admin can immediately see the saved result.
    // This avoids the confusing case where a record is created successfully
    // but the UI keeps showing an unrelated first tab.
    const actionPath = action.endpoint
      .replace(/\{[^}]+\}/g, '')
      .replace(/\/+$/g, '')
      .toLowerCase();

    const candidates = this.resources
      .map((resource) => ({
        resource,
        path: resource.endpoint.replace(/\{[^}]+\}/g, '').replace(/\/+$/g, '').toLowerCase()
      }))
      .filter(({ path }) =>
        actionPath === path || actionPath.startsWith(path + '/') || path.startsWith(actionPath + '/')
      )
      .sort((a, b) => b.path.length - a.path.length);

    const target = candidates[0]?.resource ?? this.activeResource ?? this.resources[0];
    if (target) this.loadResource(target);
  }

  displayValue(value: unknown): string {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    const text = String(value);
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(text)) {
      const d = new Date(text);
      if (!Number.isNaN(d.getTime())) return d.toLocaleString([], { day:'2-digit', month:'short', year:'numeric', hour:'numeric', minute:'2-digit' });
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      const d = new Date(text + 'T00:00:00');
      if (!Number.isNaN(d.getTime())) return d.toLocaleDateString([], { day:'2-digit', month:'short', year:'numeric' });
    }
    return text;
  }

  columnLabel(column: string): string {
    return column
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .replace(/^./, (char) => char.toUpperCase())
      .trim();
  }

  fieldInputType(field: ActionFieldConfig): string {
    if (field.type === 'number') return 'number';
    if (field.type === 'date') return 'date';
    if (field.type === 'datetime-local') return 'datetime-local';
    if (field.type === 'time') return 'time';
    return 'text';
  }

  private normalizeRows(response: unknown): Record<string, unknown>[] {
    if (Array.isArray(response)) {
      return response.map((item) => this.toRecord(item));
    }
    if (response && typeof response === 'object') {
      const objectResponse = response as Record<string, unknown>;
      for (const key of ['items', 'data', 'results', 'records']) {
        const value = objectResponse[key];
        if (Array.isArray(value)) return value.map((item) => this.toRecord(item));
      }
      return [objectResponse];
    }
    return response === null || response === undefined ? [] : [{ value: response }];
  }

  private toRecord(value: unknown): Record<string, unknown> {
    if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
    return { value };
  }

  private resolveColumns(rows: Record<string, unknown>[]): string[] {
    if (!rows.length) return [];
    const priority = ['name', 'title', 'status', 'date', 'amount'];
    let keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
    // Raw database identifiers add noise to the UI. Keep only identifiers that are
    // meaningful to people (for example, the university student number).
    keys = keys.filter((key) =>
      key.toLowerCase() === 'universitystudentid' ||
      !/(^id$|id$|userid|studentid|referenceid|notificationid|registrationid|bookingid|allocationid|paymentid)$/i.test(key)
    );
    keys = keys.filter((key) => !rows.some((row) => typeof row[key] === 'object' && row[key] !== null));
    return keys.sort((a, b) => {
      const ai = priority.findIndex((p) => a.toLowerCase().includes(p));
      const bi = priority.findIndex((p) => b.toLowerCase().includes(p));
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }).slice(0, 8);
  }

  private buildEndpoint(action: ActionConfig): string {
    let endpoint = action.endpoint;
    for (const field of action.fields ?? []) {
      if (!field.pathParam) continue;
      endpoint = endpoint.replace(`{${field.key}}`, encodeURIComponent(String(this.actionValues[field.key] ?? '')));
    }
    return endpoint;
  }

  private buildBody(fields: ActionFieldConfig[]): Record<string, unknown> {
    const body: Record<string, unknown> = {};
    for (const field of fields) {
      if (field.pathParam) continue;
      const raw = this.actionValues[field.key];
      if (raw === '' || raw === null || raw === undefined) continue;
      body[field.key] = field.type === 'number' ? Number(raw) : raw;
    }
    return body;
  }
}
