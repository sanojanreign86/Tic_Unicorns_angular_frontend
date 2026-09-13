import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon';

interface Lab{labId:number;labName:string;labType:string;capacity:number;description:string;isActive:boolean;}
interface Seat{labSeatId:number;labId:number;seatNumber:string;status:string;isActive:boolean;}
interface Slot{timeSlotId:number;labId:number;startTime:string;endTime:string;isActive:boolean;}
interface Booking{labBookingId:number;labId:number;timeSlotId:number;labSeatId?:number|null;studentId:number;bookingDate:string;startTime:string;endTime:string;status:string;createdAt:string;}
interface Student{studentId:number;firstName:string;lastName:string;}
@Component({selector:'app-admin-labs',standalone:true,imports:[CommonModule,FormsModule,AppIconComponent],templateUrl:'./admin-labs.html'})
export class AdminLabsComponent implements OnInit{
 private readonly api=inject(ApiService);private readonly cdr=inject(ChangeDetectorRef);
 labs:Lab[]=[];bookings:Booking[]=[];students:Student[]=[];selected?:Lab;seats:Seat[]=[];slots:Slot[]=[];selectedSeat?:Seat;tab:'overview'|'bookings'|'pcs'|'slots'='overview';loading=true;detailLoading=false;saving=false;error='';success='';search='';
 labModal=false;editMode=false;seatModal=false;slotModal=false;statusModal=false;labForm:any=this.emptyLab();seatForm:any={seatNumber:''};slotForm:any={startTime:'08:00',endTime:'10:00'};statusForm:any={status:'Available',reason:''};
 ngOnInit():void{this.load();}
 load():void{this.loading=true;forkJoin({labs:this.api.get<Lab[]>('Labs'),bookings:this.api.get<Booking[]>('Labs/bookings'),students:this.api.get<Student[]>('Student')}).pipe(finalize(()=>{this.loading=false;this.cdr.markForCheck();})).subscribe({next:r=>{this.labs=r.labs;this.bookings=r.bookings;this.students=r.students;},error:e=>this.error=this.readError(e,'Unable to load lab management.')});}
 get filtered():Lab[]{const q=this.search.trim().toLowerCase();return this.labs.filter(l=>!q||`${l.labName} ${l.labType} ${l.description}`.toLowerCase().includes(q));}
 openLab(l:Lab):void{this.selected=l;this.tab='overview';this.selectedSeat=undefined;this.loadDetail();}
 loadDetail():void{if(!this.selected)return;this.detailLoading=true;forkJoin({seats:this.api.get<Seat[]>(`Labs/${this.selected.labId}/seats`),slots:this.api.get<Slot[]>(`Labs/${this.selected.labId}/timeslots`)}).pipe(finalize(()=>{this.detailLoading=false;this.cdr.markForCheck();})).subscribe({next:r=>{this.seats=r.seats;this.slots=r.slots;},error:e=>this.error=this.readError(e,'Unable to load lab details.')});}
 back():void{this.selected=undefined;this.seats=[];this.slots=[];this.selectedSeat=undefined;}
 get selectedBookings():Booking[]{return this.selected?this.bookings.filter(b=>b.labId===this.selected!.labId):[];}
 studentName(id:number):string{const s=this.students.find(x=>x.studentId===id);return s?`${s.firstName} ${s.lastName}`.trim():`Student ${id}`;}
 isComputer():boolean{return this.selected?.labType?.toLowerCase().includes('computer')??false;}
 seatNumber(id?:number|null):string{return id?this.seats.find(s=>s.labSeatId===id)?.seatNumber??'PC':'—';}
 activeBookingForSeat(id:number):Booking|undefined{return this.selectedBookings.filter(b=>b.labSeatId===id&&b.status.toLowerCase()!=='cancelled'&&new Date(b.bookingDate).getTime()>=new Date().setHours(0,0,0,0)).sort((a,b)=>new Date(a.bookingDate).getTime()-new Date(b.bookingDate).getTime())[0];}
 seatClass(s:Seat):string{const st=(s.status||'').toLowerCase();if(st.includes('maint'))return'maintenance';if(!s.isActive||st.includes('inactive'))return'inactive';if(this.activeBookingForSeat(s.labSeatId))return'booked';return'';}
 openCreate():void{this.editMode=false;this.labForm=this.emptyLab();this.labModal=true;}
 openEdit():void{if(!this.selected)return;this.editMode=true;this.labForm={...this.selected};this.labModal=true;}
 saveLab():void{if(!this.labForm.labName||!this.labForm.labType)return;this.saving=true;const body={labName:this.labForm.labName,labType:this.labForm.labType,capacity:Number(this.labForm.capacity||0),description:this.labForm.description||'',...(this.editMode?{isActive:!!this.labForm.isActive}:{})};const req=this.editMode&&this.selected?this.api.put(`Labs/${this.selected.labId}`,body):this.api.post<Lab>('Labs',body);req.pipe(finalize(()=>{this.saving=false;this.cdr.markForCheck();})).subscribe({next:()=>{this.labModal=false;this.success=this.editMode?'Lab updated.':'Lab created.';this.load();if(this.selected&&this.editMode)Object.assign(this.selected,body);},error:e=>this.error=this.readError(e,'Unable to save lab.')});}
 addSeat():void{if(!this.selected||!this.seatForm.seatNumber)return;this.saving=true;this.api.post<Seat>('Labs/seats',{labId:this.selected.labId,seatNumber:this.seatForm.seatNumber}).pipe(finalize(()=>{this.saving=false;this.cdr.markForCheck();})).subscribe({next:s=>{this.seats=[...this.seats,s];this.seatModal=false;this.seatForm={seatNumber:''};this.success='Workstation added.';},error:e=>this.error=this.readError(e,'Unable to add workstation.')});}
 addSlot():void{if(!this.selected||!this.slotForm.startTime||!this.slotForm.endTime)return;this.saving=true;this.api.post<Slot>('Labs/timeslots',{labId:this.selected.labId,startTime:this.slotForm.startTime,endTime:this.slotForm.endTime}).pipe(finalize(()=>{this.saving=false;this.cdr.markForCheck();})).subscribe({next:s=>{this.slots=[...this.slots,s];this.slotModal=false;this.success='Time slot added.';},error:e=>this.error=this.readError(e,'Unable to add time slot.')});}
 openSeatStatus(s:Seat):void{this.selectedSeat=s;this.statusForm={status:s.status||'Available',reason:''};this.statusModal=true;}
 updateSeatStatus():void{if(!this.selectedSeat)return;this.saving=true;this.api.patch<any>(`Labs/seats/${this.selectedSeat.labSeatId}/status`,this.statusForm).pipe(finalize(()=>{this.saving=false;this.cdr.markForCheck();})).subscribe({next:r=>{this.statusModal=false;this.success=r?.message||'Workstation status updated.';this.loadDetail();this.load();},error:e=>this.error=this.readError(e,'Unable to update workstation status.')});}
 date(v:string):string{return new Date(v).toLocaleDateString([], {day:'2-digit',month:'short',year:'numeric'});} time(v:string):string{const raw=v?.includes('T')?v.split('T')[1]:v;const [h,m]=raw.slice(0,5).split(':').map(Number);const d=new Date();d.setHours(h||0,m||0);return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});} bookedCount():number{return this.selectedBookings.filter(b=>b.status.toLowerCase()!=='cancelled').length;}
 private emptyLab(){return{labName:'',labType:'Science',capacity:30,description:'',isActive:true};}private readError(e:any,f:string):string{return e?.error?.message??(typeof e?.error==='string'?e.error:f);}
}
