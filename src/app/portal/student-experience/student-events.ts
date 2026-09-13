import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon';

interface CampusEvent {
  eventId: number;
  venueId: number;
  eventName: string;
  description?: string | null;
  startDateTime: string;
  endDateTime: string;
  isPaid: boolean;
  usesReservedSeating: boolean;
  feeAmount?: number | null;
  holdDurationMinutes: number;
  isActive: boolean;
}
interface Venue { venueId: number; venueName: string; capacity: number; description?: string | null; }
interface EventSeat { eventSeatId: number; eventId: number; seatNumber: string; rowNumber: number; columnNumber: number; status: string; }
interface Registration { eventRegistrationId: number; eventId: number; eventSeatId?: number | null; status: number | string; expiresAt?: string | null; registeredAt: string; }

@Component({
  selector: 'app-student-events',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  templateUrl: './student-events.html'
})
export class StudentEventsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  events: CampusEvent[] = [];
  venues = new Map<number, Venue>();
  registrations: Registration[] = [];
  selectedEvent?: CampusEvent;
  seats: EventSeat[] = [];
  selectedSeatId?: number;
  activeView: 'events' | 'registrations' = 'events';
  flowStep: 'none' | 'confirm' | 'seat' | 'payment' | 'success' = 'none';
  pendingRegistration?: Registration;
  search = '';
  loading = true;
  actionLoading = false;
  error = '';
  success = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = '';
    forkJoin({
      events: this.api.get<CampusEvent[]>('Event'),
      venues: this.api.get<Venue[]>('Venue'),
      registrations: this.api.get<Registration[]>('EventRegistration/my')
    }).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); })).subscribe({
      next: ({ events, venues, registrations }) => {
        this.events = events.filter((event) => event.isActive);
        this.venues = new Map(venues.map((venue) => [venue.venueId, venue]));
        this.registrations = registrations;
      },
      error: (error) => this.error = this.readError(error, 'Unable to load events right now.')
    });
  }

  get filteredEvents(): CampusEvent[] {
    const q = this.search.trim().toLowerCase();
    return this.events.filter((event) => !q || `${event.eventName} ${event.description ?? ''} ${this.venueName(event.venueId)}`.toLowerCase().includes(q));
  }

  selectEvent(event: CampusEvent): void {
    this.selectedEvent = event;
    this.flowStep = 'none';
    this.selectedSeatId = undefined;
    this.pendingRegistration = undefined;
    this.error = ''; this.success = '';
  }

  backToEvents(): void {
    this.selectedEvent = undefined;
    this.flowStep = 'none';
    this.selectedSeatId = undefined;
    this.error = '';
  }

  startRegistration(): void {
    if (!this.selectedEvent) return;
    if (this.hasActiveRegistration(this.selectedEvent.eventId)) {
      this.error = 'You already have an active registration for this event.';
      return;
    }
    this.error = '';
    if (this.selectedEvent.usesReservedSeating) {
      this.flowStep = 'seat';
      this.loadSeats(this.selectedEvent.eventId);
    } else {
      this.flowStep = 'confirm';
    }
  }

  loadSeats(eventId: number): void {
    this.actionLoading = true;
    this.api.get<EventSeat[]>(`EventSeat/event/${eventId}`)
      .pipe(finalize(() => { this.actionLoading = false; this.cdr.markForCheck(); }))
      .subscribe({ next: (seats) => this.seats = seats, error: (e) => this.error = this.readError(e, 'Unable to load the seat map.') });
  }

  get orderedSeats(): EventSeat[] { return [...this.seats].sort((a,b) => a.rowNumber-b.rowNumber || a.columnNumber-b.columnNumber); }
  get seatColumnCount(): number { return Math.max(1, ...this.seats.map((seat) => seat.columnNumber || 1)); }
  seatAvailable(seat: EventSeat): boolean { return seat.status?.toLowerCase() === 'available'; }
  chooseSeat(seat: EventSeat): void { if (this.seatAvailable(seat)) this.selectedSeatId = seat.eventSeatId; }

  register(): void {
    const event = this.selectedEvent;
    if (!event) return;
    if (event.usesReservedSeating && !this.selectedSeatId) { this.error = 'Select an available seat to continue.'; return; }
    this.actionLoading = true; this.error = ''; this.success = '';
    const body = { eventId: event.eventId, eventSeatId: event.usesReservedSeating ? this.selectedSeatId : null };
    this.api.post<Registration>('EventRegistration', body)
      .pipe(finalize(() => { this.actionLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (registration) => {
          this.pendingRegistration = registration;
          if (event.isPaid) {
            this.flowStep = 'payment';
          } else if (Number(registration.status) === 1) {
            this.confirmFree(registration.eventRegistrationId);
          } else {
            this.finishRegistration('Registration confirmed.');
          }
        },
        error: (e) => this.error = this.readError(e, 'Unable to register for this event.')
      });
  }

  confirmFree(registrationId: number): void {
    this.actionLoading = true;
    this.api.post<Registration>(`EventRegistration/${registrationId}/confirm`, {})
      .pipe(finalize(() => { this.actionLoading = false; this.cdr.markForCheck(); }))
      .subscribe({ next: () => this.finishRegistration('Registration confirmed.'), error: (e) => this.error = this.readError(e, 'Unable to confirm the registration.') });
  }

  payEvent(): void {
    const event = this.selectedEvent;
    const registration = this.pendingRegistration;
    if (!event || !registration || !event.feeAmount) return;
    this.actionLoading = true; this.error = '';
    const paymentReference = `SIM-EVT-${registration.eventRegistrationId}-${Date.now()}`;
    this.api.post('EventPayment', {
      registrationId: registration.eventRegistrationId,
      amount: event.feeAmount,
      paymentStatus: 2,
      paymentReference,
      paidAt: new Date().toISOString()
    }).pipe(finalize(() => { this.actionLoading = false; this.cdr.markForCheck(); })).subscribe({
      next: () => this.finishRegistration('Payment completed and registration confirmed.'),
      error: (e) => this.error = this.readError(e, 'Payment could not be completed.')
    });
  }

  private finishRegistration(message: string): void {
    this.success = message;
    this.flowStep = 'success';
    this.api.get<Registration[]>('EventRegistration/my').subscribe({ next: (items) => { this.registrations = items; this.cdr.markForCheck(); } });
  }

  cancelRegistration(registration: Registration): void {
    if (!confirm('Cancel this event registration?')) return;
    this.actionLoading = true; this.error = '';
    this.api.delete<Registration>(`EventRegistration/${registration.eventRegistrationId}`)
      .pipe(finalize(() => { this.actionLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (updated) => {
          this.registrations = this.registrations.map((item) => item.eventRegistrationId === updated.eventRegistrationId ? updated : item);
          this.success = 'Registration cancelled. A notification has been added to your account.';
        },
        error: (e) => this.error = this.readError(e, 'Unable to cancel this registration.')
      });
  }

  eventFor(registration: Registration): CampusEvent | undefined { return this.events.find((event) => event.eventId === registration.eventId); }
  venueName(venueId: number): string { return this.venues.get(venueId)?.venueName ?? 'Campus venue'; }
  registrationStatus(status: number | string): string {
    const value = Number(status);
    return ({ 1: 'Held', 2: 'Confirmed', 3: 'Cancelled', 4: 'Expired' } as Record<number, string>)[value] ?? String(status);
  }
  isConfirmed(registration: Registration): boolean { return Number(registration.status) === 2; }
  isInactive(registration: Registration): boolean { return [3, 4].includes(Number(registration.status)); }
  canCancel(registration: Registration): boolean {
    if (this.isInactive(registration)) return false;
    const event = this.eventFor(registration);
    if (!event) return false;
    if (event.isPaid && Number(registration.status) === 2) return false;
    return new Date(event.startDateTime).getTime() > Date.now();
  }
  hasActiveRegistration(eventId: number): boolean { return this.registrations.some((r) => r.eventId === eventId && !this.isInactive(r)); }
  formatDate(value: string): string { return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }); }
  selectedSeatLabel(): string { return this.seats.find((seat) => seat.eventSeatId === this.selectedSeatId)?.seatNumber ?? '—'; }

  private readError(error: any, fallback: string): string { return error?.error?.message ?? (typeof error?.error === 'string' ? error.error : fallback); }
}
