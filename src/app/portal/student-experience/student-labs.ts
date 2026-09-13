import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, finalize, switchMap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon';

interface Lab { labId: number; labName: string; labType: string; capacity: number; description: string; isActive: boolean; }
interface LabTimeSlot { timeSlotId: number; labId: number; startTime: string; endTime: string; isActive: boolean; }
interface SeatAvailability { labSeatId: number; seatNumber: string; isAvailable: boolean; status: string; canBookRequestedDuration: boolean; availableHoursFromRequestedStart: number; }
interface LabAvailability { labId: number; labName: string; labType: string; timeSlotId: number; bookingDate: string; slotStartTime: string; slotEndTime: string; capacity: number; bookedCount: number; availableCount: number; isFull: boolean; isSeatBased: boolean; requestedStartTime?: string | null; requestedEndTime?: string | null; requestedHours?: number | null; maxComputerBookingHours: number; message: string; seats: SeatAvailability[]; }
interface LabBooking { labBookingId: number; labId: number; timeSlotId: number; labSeatId?: number | null; studentId: number; bookingDate: string; startTime: string; endTime: string; status: string; createdAt: string; }

@Component({
  selector: 'app-student-labs',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  templateUrl: './student-labs.html'
})
export class StudentLabsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  labs: Lab[] = [];
  bookings: LabBooking[] = [];
  selectedLab?: Lab;
  slots: LabTimeSlot[] = [];
  selectedSlotId?: number;
  selectedSeatId?: number;
  availability?: LabAvailability;
  bookingDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  activeView: 'labs' | 'bookings' = 'labs';
  bookingOpen = false;
  loading = true;
  actionLoading = false;
  error = '';
  success = '';
  search = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = '';
    forkJoin({ labs: this.api.get<Lab[]>('Labs'), bookings: this.api.get<LabBooking[]>('Labs/bookings/my') })
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({ next: ({ labs, bookings }) => { this.labs = labs.filter(l => l.isActive); this.bookings = bookings; }, error: e => this.error = this.readError(e, 'Unable to load lab services.') });
  }

  get filteredLabs(): Lab[] { const q=this.search.trim().toLowerCase(); return this.labs.filter(l => !q || `${l.labName} ${l.labType} ${l.description}`.toLowerCase().includes(q)); }

  openLab(lab: Lab): void {
    this.selectedLab = lab; this.bookingOpen = false; this.error=''; this.success=''; this.availability=undefined; this.selectedSeatId=undefined; this.selectedSlotId=undefined;
    this.actionLoading = true;
    this.api.get<LabTimeSlot[]>(`Labs/${lab.labId}/timeslots`).pipe(finalize(()=>{this.actionLoading=false;this.cdr.markForCheck();})).subscribe({ next: slots => this.slots=slots.filter(s=>s.isActive), error:e=>this.error=this.readError(e,'Unable to load time slots.') });
  }
  back(): void { this.selectedLab=undefined; this.bookingOpen=false; this.availability=undefined; this.error=''; }
  startBooking(): void { this.bookingOpen=true; this.availability=undefined; this.selectedSeatId=undefined; this.error=''; }

  checkAvailability(): void {
    if (!this.selectedLab || !this.selectedSlotId || !this.bookingDate) { this.error='Choose a date and an available time slot first.'; return; }
    const slot=this.slots.find(s=>s.timeSlotId===this.selectedSlotId); if(!slot)return;
    let params = new HttpParams().set('timeSlotId', this.selectedSlotId).set('bookingDate', this.bookingDate);
    if (this.isComputerLab) {
      const hours=this.slotHours(slot);
      params=params.set('requestedStartTime', this.timeOnly(slot.startTime)).set('requestedHours', Math.min(hours,4).toString());
    }
    this.actionLoading=true; this.error=''; this.selectedSeatId=undefined;
    this.api.get<LabAvailability>(`Labs/${this.selectedLab.labId}/availability`, params).pipe(finalize(()=>{this.actionLoading=false;this.cdr.markForCheck();})).subscribe({ next:a=>this.availability=a, error:e=>this.error=this.readError(e,'Availability could not be checked.') });
  }

  confirmBooking(): void {
    if (!this.selectedLab || !this.selectedSlotId || !this.availability) return;
    if (this.isComputerLab && !this.selectedSeatId) { this.error='Select an available computer before confirming.'; return; }
    const slot=this.slots.find(s=>s.timeSlotId===this.selectedSlotId); if(!slot)return;
    const body:any={ labId:this.selectedLab.labId, timeSlotId:this.selectedSlotId, labSeatId:this.isComputerLab?this.selectedSeatId:null, bookingDate:this.bookingDate };
    if(this.isComputerLab){body.requestedStartTime=this.timeOnly(slot.startTime);body.requestedHours=Math.min(this.slotHours(slot),4);}
    this.actionLoading=true; this.error='';
    this.api.post<LabBooking>('Labs/bookings', body).pipe(finalize(()=>{this.actionLoading=false;this.cdr.markForCheck();})).subscribe({ next:b=>{this.bookings=[b,...this.bookings];this.success='Lab booking confirmed. You can review it under My bookings.';this.bookingOpen=false;this.availability=undefined;}, error:e=>this.error=this.readError(e,'Unable to create the lab booking.') });
  }

  cancelBooking(booking: LabBooking): void {
    if(!confirm('Cancel this lab booking?'))return;
    this.actionLoading=true;this.error='';
    this.api.patch(`Labs/bookings/${booking.labBookingId}/cancel`,{}).pipe(finalize(()=>{this.actionLoading=false;this.cdr.markForCheck();})).subscribe({next:()=>{this.bookings=this.bookings.map(b=>b.labBookingId===booking.labBookingId?{...b,status:'Cancelled'}:b);this.success='Lab booking cancelled.';},error:e=>this.error=this.readError(e,'Unable to cancel the lab booking.')});
  }

  get isComputerLab(): boolean { return this.selectedLab?.labType?.toLowerCase().includes('computer') ?? false; }
  labName(id:number):string{return this.labs.find(l=>l.labId===id)?.labName??'Lab';}
  seatAvailable(seat:SeatAvailability):boolean{return !!seat.isAvailable && !!seat.canBookRequestedDuration;}
  chooseSeat(seat:SeatAvailability):void{if(this.seatAvailable(seat))this.selectedSeatId=seat.labSeatId;}
  selectedSeatLabel():string{return this.availability?.seats.find(s=>s.labSeatId===this.selectedSeatId)?.seatNumber??'—';}
  formatTime(value:string):string{const [h,m]=this.timeOnly(value).split(':').map(Number);const d=new Date();d.setHours(h||0,m||0);return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});}
  timeOnly(value:string):string{return value?.includes('T')?value.split('T')[1].slice(0,8):value.slice(0,8);}
  slotHours(slot:LabTimeSlot):number{const parse=(v:string)=>{const [h,m,s]=this.timeOnly(v).split(':').map(Number);return h+(m||0)/60+(s||0)/3600};let n=parse(slot.endTime)-parse(slot.startTime);if(n<=0)n+=24;return n;}
  formatDate(value:string):string{return new Date(value).toLocaleDateString([], {dateStyle:'medium'});}
  private readError(error:any,fallback:string):string{return error?.error?.message??(typeof error?.error==='string'?error.error:fallback);}
}
