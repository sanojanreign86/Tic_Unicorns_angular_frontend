import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon';

interface CampusEvent { eventId:number; venueId:number; eventName:string; description?:string|null; startDateTime:string; endDateTime:string; isPaid:boolean; usesReservedSeating:boolean; feeAmount?:number|null; holdDurationMinutes:number; isActive:boolean; }
interface Venue { venueId:number; venueName:string; capacity:number; description?:string|null; isActive:boolean; }
interface Registration { eventRegistrationId:number; eventId:number; studentId:number; eventSeatId?:number|null; status:number|string; heldAt?:string|null; expiresAt?:string|null; registeredAt:string; }
interface EventSeat { eventSeatId:number; eventId:number; seatNumber:string; rowNumber:number; columnNumber:number; status:string; }
interface Payment { eventPaymentId:number; registrationId:number; amount:number; paymentStatus:number|string; paymentReference?:string|null; paidAt?:string|null; }
interface Student { studentId:number; firstName:string; lastName:string; }

@Component({
  selector:'app-admin-events',
  standalone:true,
  imports:[CommonModule,FormsModule,AppIconComponent],
  templateUrl:'./admin-events.html'
})
export class AdminEventsComponent implements OnInit {
  private readonly api=inject(ApiService); private readonly cdr=inject(ChangeDetectorRef);
  events:CampusEvent[]=[]; venues:Venue[]=[]; students:Student[]=[];
  selected?:CampusEvent; registrations:Registration[]=[]; seats:EventSeat[]=[]; payments:Payment[]=[];
  selectedSeat?:EventSeat; tab:'overview'|'registrations'|'seats'|'payments'|'settings'='overview';
  loading=true; detailLoading=false; saving=false; error=''; success=''; search='';
  eventModal=false; editMode=false; venueModal=false; seatModal=false;
  eventForm:any=this.emptyEvent(); venueForm:any={venueName:'',capacity:100,description:'',isActive:true}; seatForm:any={seatNumber:'',rowNumber:1,columnNumber:1,status:'Available'};

  ngOnInit():void{this.load();}
  load():void{this.loading=true;this.error='';forkJoin({events:this.api.get<CampusEvent[]>('Event'),venues:this.api.get<Venue[]>('Venue'),students:this.api.get<Student[]>('Student')}).pipe(finalize(()=>{this.loading=false;this.cdr.markForCheck();})).subscribe({next:r=>{this.events=r.events;this.venues=r.venues;this.students=r.students;},error:e=>this.error=this.readError(e,'Unable to load events.')});}
  get filtered():CampusEvent[]{const q=this.search.trim().toLowerCase();return this.events.filter(e=>!q||`${e.eventName} ${e.description??''} ${this.venueName(e.venueId)}`.toLowerCase().includes(q));}
  openEvent(e:CampusEvent):void{this.selected=e;this.tab='overview';this.selectedSeat=undefined;this.loadDetail();}
  back():void{this.selected=undefined;this.registrations=[];this.seats=[];this.payments=[];this.selectedSeat=undefined;}
  loadDetail():void{if(!this.selected)return;this.detailLoading=true;this.error='';forkJoin({registrations:this.api.get<Registration[]>(`EventRegistration/event/${this.selected.eventId}`),seats:this.api.get<EventSeat[]>(`EventSeat/event/${this.selected.eventId}`),payments:this.api.get<Payment[]>('EventPayment')}).pipe(finalize(()=>{this.detailLoading=false;this.cdr.markForCheck();})).subscribe({next:r=>{this.registrations=r.registrations;this.seats=r.seats;const ids=new Set(r.registrations.map(x=>x.eventRegistrationId));this.payments=r.payments.filter(p=>ids.has(p.registrationId));},error:e=>this.error=this.readError(e,'Unable to load event details.')});}
  venueName(id:number):string{return this.venues.find(v=>v.venueId===id)?.venueName??'Campus venue';}
  studentName(id:number):string{const s=this.students.find(x=>x.studentId===id);return s?`${s.firstName} ${s.lastName}`.trim():`Student ${id}`;}
  registrationStatus(v:number|string):string{if(typeof v==='string'&&isNaN(Number(v)))return v;return ({1:'Held',2:'Confirmed',3:'Cancelled',4:'Expired'} as Record<number,string>)[Number(v)]??String(v);}
  paymentStatus(v:number|string):string{if(typeof v==='string'&&isNaN(Number(v)))return v;return ({1:'Pending',2:'Paid',3:'Failed',4:'Refunded'} as Record<number,string>)[Number(v)]??String(v);}
  seatForReg(r:Registration):string{return this.seats.find(s=>s.eventSeatId===r.eventSeatId)?.seatNumber??'General admission';}
  paymentForReg(id:number):Payment|undefined{return this.payments.find(p=>p.registrationId===id);}
  registrationById(id:number):Registration|undefined{return this.registrations.find(r=>r.eventRegistrationId===id);}
  confirmedCount():number{return this.registrations.filter(r=>Number(r.status)===2||String(r.status).toLowerCase()==='confirmed').length;}
  registrationForSeat(seat:EventSeat):Registration|undefined{return this.registrations.find(r=>r.eventSeatId===seat.eventSeatId&&!['3','4','Cancelled','Expired'].includes(String(r.status)));}
  seatClass(seat:EventSeat):string{const s=(seat.status||'').toLowerCase();if(s.includes('book')||this.registrationForSeat(seat)?.status===2)return'booked';if(s.includes('hold')||this.registrationForSeat(seat)?.status===1)return'held';return'';}
  seatRows():{row:number;seats:EventSeat[]}[]{const map=new Map<number,EventSeat[]>();for(const s of [...this.seats].sort((a,b)=>a.rowNumber-b.rowNumber||a.columnNumber-b.columnNumber)){if(!map.has(s.rowNumber))map.set(s.rowNumber,[]);map.get(s.rowNumber)!.push(s);}return[...map.entries()].map(([row,seats])=>({row,seats}));}
  selectSeat(s:EventSeat):void{this.selectedSeat=s;}
  selectedSeatRegistration():Registration|undefined{return this.selectedSeat?this.registrationForSeat(this.selectedSeat):undefined;}
  openCreate():void{this.editMode=false;this.eventForm=this.emptyEvent();this.eventModal=true;this.api.get<number>('SystemSetting/reservation-hold-minutes').subscribe({next:m=>{this.eventForm.holdDurationMinutes=m;this.cdr.markForCheck();},error:()=>{}});}
  openEdit():void{if(!this.selected)return;this.editMode=true;this.eventForm={...this.selected,startDateTime:this.localDateTime(this.selected.startDateTime),endDateTime:this.localDateTime(this.selected.endDateTime)};this.eventModal=true;}
  saveEvent():void{if(!this.eventForm.venueId||!this.eventForm.eventName||!this.eventForm.startDateTime||!this.eventForm.endDateTime)return;this.saving=true;this.error='';const body={...this.eventForm,venueId:Number(this.eventForm.venueId),feeAmount:this.eventForm.isPaid?Number(this.eventForm.feeAmount||0):null,holdDurationMinutes:Number(this.eventForm.holdDurationMinutes||15)};const req=this.editMode&&this.selected?this.api.put(`Event/${this.selected.eventId}`,body):this.api.post<CampusEvent>('Event',body);req.pipe(finalize(()=>{this.saving=false;this.cdr.markForCheck();})).subscribe({next:(r:any)=>{this.eventModal=false;this.success=this.editMode?'Event updated.':'Event created.';if(this.editMode&&this.selected){Object.assign(this.selected,body);this.load();}else{this.load();}},error:e=>this.error=this.readError(e,'Unable to save the event.')});}
  saveVenue():void{if(!this.venueForm.venueName)return;this.saving=true;this.api.post<Venue>('Venue',{...this.venueForm,capacity:Number(this.venueForm.capacity)}).pipe(finalize(()=>{this.saving=false;this.cdr.markForCheck();})).subscribe({next:v=>{this.venues=[...this.venues,v];this.venueForm={venueName:'',capacity:100,description:'',isActive:true};this.success='Venue created.';},error:e=>this.error=this.readError(e,'Unable to create venue.')});}
  saveSeat():void{if(!this.selected||!this.seatForm.seatNumber)return;this.saving=true;this.api.post<EventSeat>('EventSeat',{eventSeatId:0,eventId:this.selected.eventId,seatNumber:this.seatForm.seatNumber,rowNumber:Number(this.seatForm.rowNumber),columnNumber:Number(this.seatForm.columnNumber),status:this.seatForm.status||'Available'}).pipe(finalize(()=>{this.saving=false;this.cdr.markForCheck();})).subscribe({next:s=>{this.seats=[...this.seats,s];this.seatModal=false;this.seatForm={seatNumber:'',rowNumber:1,columnNumber:1,status:'Available'};this.success='Seat added.';},error:e=>this.error=this.readError(e,'Unable to add seat.')});}
  date(v:string):string{return new Date(v).toLocaleDateString([], {day:'2-digit',month:'short',year:'numeric'});} time(v:string):string{return new Date(v).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});} localDateTime(v:string):string{const d=new Date(v);const pad=(n:number)=>String(n).padStart(2,'0');return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;}
  private emptyEvent(){return{venueId:'',eventName:'',description:'',startDateTime:'',endDateTime:'',isPaid:false,usesReservedSeating:false,feeAmount:null,holdDurationMinutes:15,isActive:true};}
  private readError(e:any,f:string):string{return e?.error?.message??(typeof e?.error==='string'?e.error:f);}
}
