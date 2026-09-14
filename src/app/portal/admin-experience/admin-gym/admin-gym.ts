import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon';

interface Gym {
  gymId: number;
  name: string;
  location: string;
  capacity: number;
  description: string;
  isActive: boolean;
}

interface Slot {
  slotId: number;
  gymId: number;
  gymName?: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  remainingCapacity: number;
  isAvailable: boolean;
  requiresPayment: boolean;
  feeAmount: number;
}

interface Availability { slots: Slot[]; }
interface Booking {
  bookingId: number;
  userId: number;
  gymId: number;
  gymName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  requiresPayment: boolean;
  feeAmount: number;
  paymentStatus: string;
}
interface Student { studentId: number; userId?: number | null; firstName: string; lastName: string; masterStudentId: number; }
interface Master { masterStudentId: number; universityStudentId: string; }

@Component({
  selector: 'app-admin-gym',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  templateUrl: './admin-gym.html'
})
export class AdminGymComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  gyms: Gym[] = [];
  bookings: Booking[] = [];
  students: Student[] = [];
  masters: Master[] = [];
  selected?: Gym;
  slots: Slot[] = [];
  date = this.tomorrowDate();
  tab: 'overview' | 'slots' | 'bookings' = 'overview';
  loading = true;
  detailLoading = false;
  saving = false;
  error = '';
  success = '';
  search = '';
  gymModal = false;
  slotModal = false;

  gymForm: any = { name: '', location: '', capacity: 30, description: '' };
  slotForm: any = {
    slotDate: this.tomorrowDate(),
    startTime: '08:00',
    endTime: '09:00',
    maxCapacity: 20,
    requiresPayment: false,
    feeAmount: 0
  };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    forkJoin({
      gyms: this.api.get<Gym[]>('Gym'),
      bookings: this.api.get<Booking[]>('Gym/bookings'),
      students: this.api.get<Student[]>('Student'),
      masters: this.api.get<Master[]>('StudentMasterList')
    }).pipe(finalize(() => {
      this.loading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: r => {
        this.gyms = r.gyms;
        this.bookings = r.bookings;
        this.students = r.students;
        this.masters = r.masters;
      },
      error: e => this.error = this.readError(e, 'Unable to load gym management.')
    });
  }

  get filtered(): Gym[] {
    const q = this.search.toLowerCase().trim();
    return this.gyms.filter(g => !q || `${g.name} ${g.location}`.toLowerCase().includes(q));
  }

  openGym(g: Gym): void {
    this.selected = g;
    this.tab = 'overview';
    this.date = this.tomorrowDate();
    this.slotForm.slotDate = this.date;
    this.loadSlots();
  }

  back(): void { this.selected = undefined; this.slots = []; }

  loadSlots(): void {
    if (!this.selected) return;
    this.detailLoading = true;
    this.error = '';
    const params = new HttpParams().set('date', this.date);
    this.api.get<Availability>(`Gym/${this.selected.gymId}/availability`, params)
      .pipe(finalize(() => {
        this.detailLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: a => this.slots = a.slots ?? [],
        error: e => this.error = this.readError(e, 'Unable to load gym slots.')
      });
  }

  get selectedBookings(): Booking[] {
    return this.selected ? this.bookings.filter(b => b.gymId === this.selected!.gymId) : [];
  }

  studentLabel(userId: number): string {
    const s = this.students.find(x => x.userId === userId);
    if (!s) return 'Active student';
    const m = this.masters.find(x => x.masterStudentId === s.masterStudentId);
    return `${s.firstName} ${s.lastName}${m?.universityStudentId ? ' · ' + m.universityStudentId : ''}`;
  }

  createGym(): void {
    this.error = '';
    this.success = '';
    if (!this.gymForm.name?.trim() || !this.gymForm.location?.trim() || Number(this.gymForm.capacity) <= 0) {
      this.error = 'Name, location and a valid capacity are required.';
      return;
    }
    this.saving = true;
    const body = {
      name: this.gymForm.name.trim(),
      location: this.gymForm.location.trim(),
      capacity: Number(this.gymForm.capacity),
      description: this.gymForm.description?.trim() ?? ''
    };
    this.api.post<Gym>('Gym', body)
      .pipe(finalize(() => { this.saving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: g => {
          this.gyms = [...this.gyms, g];
          this.gymModal = false;
          this.gymForm = { name: '', location: '', capacity: 30, description: '' };
          this.success = 'Gym created.';
        },
        error: e => this.error = this.readError(e, 'Unable to create gym.')
      });
  }

  openSlotModal(): void {
    if (!this.selected) return;
    this.error = '';
    this.success = '';
    const chosenDate = this.date || this.tomorrowDate();
    this.slotForm = {
      slotDate: chosenDate,
      startTime: '08:00',
      endTime: '09:00',
      maxCapacity: Math.min(20, this.selected.capacity),
      requiresPayment: false,
      feeAmount: 0
    };
    this.slotModal = true;
  }

  addSlot(): void {
    if (!this.selected) return;
    this.error = '';
    this.success = '';

    const slotDate = String(this.slotForm.slotDate || '').trim();
    const start = String(this.slotForm.startTime || '').trim();
    const end = String(this.slotForm.endTime || '').trim();
    const maxCapacity = Number(this.slotForm.maxCapacity);
    const feeAmount = Number(this.slotForm.feeAmount || 0);

    if (!slotDate || !start || !end) {
      this.error = 'Date, start time and end time are required.';
      return;
    }
    if (slotDate < this.todayDate()) {
      this.error = 'A gym session cannot be created in the past.';
      return;
    }
    if (end <= start) {
      this.error = 'End time must be later than start time.';
      return;
    }
    if (!Number.isFinite(maxCapacity) || maxCapacity < 1 || maxCapacity > this.selected.capacity) {
      this.error = `Maximum capacity must be between 1 and ${this.selected.capacity}.`;
      return;
    }
    if (this.slotForm.requiresPayment && feeAmount <= 0) {
      this.error = 'Enter a fee amount greater than 0 for a paid session.';
      return;
    }

    this.saving = true;
    // ASP.NET TimeSpan binding is most reliable with HH:mm:ss and DateTime
    // binding with an explicit midnight component.
    const body = {
      gymId: this.selected.gymId,
      slotDate: `${slotDate}T00:00:00`,
      startTime: this.toTimeSpan(start),
      endTime: this.toTimeSpan(end),
      maxCapacity,
      requiresPayment: !!this.slotForm.requiresPayment,
      feeAmount: this.slotForm.requiresPayment ? feeAmount : 0
    };

    this.api.post<Slot>('Gym/slots', body)
      .pipe(finalize(() => { this.saving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: created => {
          this.slotModal = false;
          this.success = 'Gym time slot created successfully.';
          // Keep the visible list in sync immediately, then reload from backend
          // so booked/remaining counts are authoritative.
          if (slotDate === this.date) this.slots = [...this.slots, created].sort((a, b) => a.startTime.localeCompare(b.startTime));
          this.loadSlots();
        },
        error: e => this.error = this.readError(e, 'Unable to create gym slot.')
      });
  }

  complete(b: Booking): void {
    this.saving = true;
    this.error = '';
    this.api.post<Booking>(`Gym/bookings/${b.bookingId}/complete`, {})
      .pipe(finalize(() => { this.saving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: u => {
          this.bookings = this.bookings.map(x => x.bookingId === u.bookingId ? u : x);
          this.success = 'Gym booking marked completed.';
        },
        error: e => this.error = this.readError(e, 'Unable to complete gym booking.')
      });
  }

  dateLabel(v: string): string {
    return new Date(v).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  }

  time(v: string): string {
    const [h, m] = v.slice(0, 5).split(':').map(Number);
    const d = new Date();
    d.setHours(h || 0, m || 0);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private toTimeSpan(value: string): string {
    const parts = value.split(':');
    const hh = (parts[0] || '00').padStart(2, '0');
    const mm = (parts[1] || '00').padStart(2, '0');
    return `${hh}:${mm}:00`;
  }

  private todayDate(): string { return new Date().toISOString().slice(0, 10); }
  private tomorrowDate(): string { return new Date(Date.now() + 86400000).toISOString().slice(0, 10); }

  private readError(e: any, fallback: string): string {
    if (typeof e?.error === 'string' && e.error.trim()) return this.cleanServerText(e.error, fallback);
    if (e?.error?.message) return String(e.error.message);
    const validation = e?.error?.errors;
    if (validation && typeof validation === 'object') {
      const messages = Object.values(validation).flat().filter(Boolean).map(String);
      if (messages.length) return messages.join(' ');
    }
    return fallback;
  }

  private cleanServerText(value: string, fallback: string): string {
    const text = value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return fallback;
    const known = [
      'A gym slot cannot be created in the past.',
      'End time must be later than start time.',
      'This gym already has an overlapping time slot on the selected date.',
      'The gym is inactive.'
    ].find(message => text.includes(message));
    return known ?? fallback;
  }
}
