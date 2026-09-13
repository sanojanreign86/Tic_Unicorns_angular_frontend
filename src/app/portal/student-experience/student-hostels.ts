import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { StudentProfileService, CurrentStudentProfile } from '../../core/services/student-profile.service';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon';

interface Bed { bedId:number; bedNumber:string; status:string; isAvailable:boolean; }
interface Room { roomId:number; roomNumber:string; capacity:number; roomType:string; isAvailable:boolean; beds:Bed[]; }
interface Floor { floorId:number; floorNumber:number; name:string; rooms:Room[]; }
interface Hostel { hostelId:number; hostelName:string; hostelType:string; description?:string|null; isActive?:boolean; floors:Floor[]; }
interface Hold { hostelRoomHoldId:number; roomBedId:number; heldAt:string; expiresAt:string; status:string; }
interface HostelApplication { hostelApplicationId:number; hostelId:number; requestedBedId?:number|null; district:string; province:string; reason?:string|null; status:string; createdAt:string; }
interface Allocation { hostelAllocationId:number; applicationId:number; bedId:number; allocatedAt:string; status:string; }
interface HostelPayment { hostelAllocationId:number; amount:number; feeStatus:string; paymentStatus:string; paymentReference?:string|null; dueDate?:string|null; paidAt?:string|null; }

@Component({selector:'app-student-hostels',standalone:true,imports:[CommonModule,FormsModule,AppIconComponent],templateUrl:'./student-hostels.html'})
export class StudentHostelsComponent implements OnInit {
  private readonly api=inject(ApiService); private readonly profileService=inject(StudentProfileService); private readonly cdr=inject(ChangeDetectorRef);
  hostels:Hostel[]=[]; applications:HostelApplication[]=[]; allocations:Allocation[]=[];
  selectedHostel?:Hostel; selectedFloor?:Floor; selectedRoom?:Room; selectedBed?:Bed; hold?:Hold;
  district=''; province=''; reason=''; activeView:'hostels'|'applications'|'allocations'='hostels';
  loading=true; actionLoading=false; error=''; success=''; payment?:HostelPayment;
  eligibilityMessage='No hostel currently matches your student eligibility.'; profile?:CurrentStudentProfile; profileGender=''; profileSaving=false;

  ngOnInit():void{this.load();}
  load():void{
    this.loading=true;this.error='';this.eligibilityMessage='No hostel currently matches your student eligibility.';
    const eligibleHostels$=this.api.get<Hostel[]>('Hostel').pipe(catchError(e=>{
      if(e?.status===409){
        this.eligibilityMessage=this.readError(e,'Your hostel eligibility is not configured yet.');
        return of([] as Hostel[]);
      }
      throw e;
    }));
    forkJoin({profile:this.profileService.current(),hostels:eligibleHostels$,applications:this.api.get<HostelApplication[]>('Hostel/applications/my'),allocations:this.api.get<Allocation[]>('Hostel/allocations/my')})
      .pipe(finalize(()=>{this.loading=false;this.cdr.markForCheck();}))
      .subscribe({next:r=>{this.profile=r.profile;this.profileGender=(r.profile.gender||'').trim();this.hostels=r.hostels;this.applications=r.applications;this.allocations=r.allocations;if(!this.profileGender)this.eligibilityMessage='Choose your hostel eligibility once to see the right accommodation options.';},error:e=>this.error=this.readError(e,'Unable to load hostel services.')});
  }


  get hasSavedEligibility(): boolean {
    return !!(this.profile?.gender || '').trim();
  }

  get eligibleHostels():Hostel[]{
    const g=(this.profile?.gender||'').trim().toLowerCase();
    if(!g)return[];
    const target=g.startsWith('m')?'boys':g.startsWith('f')?'girls':'';
    if(!target)return[];
    return this.hostels.filter(h=>{const type=(h.hostelType||'').toLowerCase();const name=(h.hostelName||'').toLowerCase();return h.isActive!==false && (type.includes(target)||type.includes(g)||name.includes(target));});
  }
  saveEligibility():void{
    if(!this.profile||!this.profileGender)return;
    const selectedGender=this.profileGender;
    this.profileSaving=true;this.error='';
    this.profileService.updateCurrent(this.profile,{gender:selectedGender})
      .pipe(finalize(()=>{this.profileSaving=false;this.cdr.markForCheck();}))
      .subscribe({
        next:p=>{
          this.profile={...p,gender:p.gender||selectedGender};
          this.profileGender=this.profile.gender||selectedGender;
          this.success='Hostel eligibility saved. Showing the accommodation options that match your profile.';
          this.reloadEligibleHostels();
          this.cdr.markForCheck();
          window.setTimeout(()=>{this.success='';this.cdr.markForCheck();},3500);
        },
        error:e=>this.error=this.readError(e,'Unable to update hostel eligibility.')
      });
  }

  private reloadEligibleHostels():void{
    this.api.get<Hostel[]>('Hostel').subscribe({
      next:items=>{this.hostels=items;this.eligibilityMessage='No hostel currently matches your student eligibility.';this.cdr.markForCheck();},
      error:e=>{this.error=this.readError(e,'Unable to load eligible hostels.');this.cdr.markForCheck();}
    });
  }

  openHostel(hostel:Hostel):void{this.selectedHostel=hostel;this.selectedFloor=undefined;this.selectedRoom=undefined;this.selectedBed=undefined;this.hold=undefined;this.error='';this.actionLoading=true;this.api.get<Hostel>(`Hostel/${hostel.hostelId}/blueprint`).pipe(finalize(()=>{this.actionLoading=false;this.cdr.markForCheck();})).subscribe({next:h=>this.selectedHostel=h,error:e=>this.error=this.readError(e,'Unable to load hostel rooms.')});}
  back():void{if(this.hold)return;if(this.selectedBed){this.selectedBed=undefined;return;}if(this.selectedRoom){this.selectedRoom=undefined;return;}if(this.selectedFloor){this.selectedFloor=undefined;return;}this.selectedHostel=undefined;}
  selectFloor(f:Floor):void{this.selectedFloor=f;this.selectedRoom=undefined;this.selectedBed=undefined;this.hold=undefined;}
  selectRoom(r:Room):void{if(r.isAvailable){this.selectedRoom=r;this.selectedBed=undefined;this.hold=undefined;}}
  selectBed(b:Bed):void{if(b.isAvailable)this.selectedBed=b;}
  holdBed():void{if(!this.selectedBed)return;this.actionLoading=true;this.error='';this.api.post<Hold>(`Hostel/holds/${this.selectedBed.bedId}`,{}).pipe(finalize(()=>{this.actionLoading=false;this.cdr.markForCheck();})).subscribe({next:h=>{this.hold=h;this.success='Bed held temporarily. Complete your application before the hold expires.';},error:e=>this.error=this.readError(e,'Unable to hold this bed.')});}
  submitApplication():void{if(!this.selectedHostel||!this.hold)return;if(!this.district.trim()||!this.province.trim()){this.error='District and province are required for the hostel application.';return;}this.actionLoading=true;this.error='';this.api.post<HostelApplication>('Hostel/applications',{hostelId:this.selectedHostel.hostelId,holdId:this.hold.hostelRoomHoldId,district:this.district.trim(),province:this.province.trim(),reason:this.reason.trim()||null}).pipe(finalize(()=>{this.actionLoading=false;this.cdr.markForCheck();})).subscribe({next:a=>{this.applications=[a,...this.applications];this.success='Hostel application submitted successfully.';this.activeView='applications';this.selectedHostel=undefined;this.selectedFloor=undefined;this.selectedRoom=undefined;this.selectedBed=undefined;this.hold=undefined;},error:e=>this.error=this.readError(e,'Unable to submit the hostel application.')});}
  cancelApplication(app:HostelApplication):void{if(!confirm('Cancel this hostel application?'))return;this.actionLoading=true;this.api.delete(`Hostel/applications/${app.hostelApplicationId}`).pipe(finalize(()=>{this.actionLoading=false;this.cdr.markForCheck();})).subscribe({next:()=>{this.applications=this.applications.map(a=>a.hostelApplicationId===app.hostelApplicationId?{...a,status:'Cancelled'}:a);this.success='Hostel application cancelled.';},error:e=>this.error=this.readError(e,'Unable to cancel the application.')});}
  loadPayment(allocation:Allocation):void{this.actionLoading=true;this.payment=undefined;this.api.get<HostelPayment>(`Hostel/allocations/${allocation.hostelAllocationId}/payment`).pipe(finalize(()=>{this.actionLoading=false;this.cdr.markForCheck();})).subscribe({next:p=>this.payment=p,error:e=>this.error=this.readError(e,'Unable to load hostel payment details.')});}
  pay(allocation:Allocation):void{this.actionLoading=true;this.api.post<HostelPayment>(`Hostel/allocations/${allocation.hostelAllocationId}/pay`,{paymentReference:`SIM-HST-${allocation.hostelAllocationId}-${Date.now()}`}).pipe(finalize(()=>{this.actionLoading=false;this.cdr.markForCheck();})).subscribe({next:p=>{this.payment=p;this.success='Hostel fee payment completed.';},error:e=>this.error=this.readError(e,'Unable to complete hostel payment.')});}
  hostelName(id:number):string{return this.hostels.find(h=>h.hostelId===id)?.hostelName??'Hostel';}
  availableBeds(room:Room):number{return room.beds.filter(b=>b.isAvailable).length;}
  formatDate(v:string):string{return new Date(v).toLocaleString([], {dateStyle:'medium',timeStyle:'short'});}
  canCancelApplication(app:HostelApplication):boolean{return ['pending'].includes(app.status?.toLowerCase());}
  private readError(e:any,f:string):string{return e?.error?.message??(typeof e?.error==='string'?e.error:f);}
}
