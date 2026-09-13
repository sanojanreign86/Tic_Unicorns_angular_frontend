import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { StudentProfileService, CurrentStudentProfile } from '../../core/services/student-profile.service';
import { PORTAL_MODULES, roleCanAccess } from '../../core/config/portal-modules';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon';

interface CampusEvent { eventId:number; eventName:string; startDateTime:string; endDateTime:string; }
interface Registration { eventId:number; status:number|string; }
interface UnreadResponse { unreadCount:number; }

@Component({selector:'app-portal-dashboard',standalone:true,imports:[CommonModule,RouterLink,FormsModule,AppIconComponent],templateUrl:'./portal-dashboard.html',styleUrl:'./portal-dashboard.css'})
export class PortalDashboardComponent implements OnInit {
  readonly auth=inject(AuthService);
  private readonly api=inject(ApiService);
  private readonly profileService=inject(StudentProfileService);
  private readonly cdr=inject(ChangeDetectorRef);
  get user(){return this.auth.getCurrentUser();}
  readonly modules=PORTAL_MODULES.filter(m=>roleCanAccess(m.roles,this.auth.getRole()));
  upcomingEvents:CampusEvent[]=[];
  dashboardLoading=false;
  displayName=this.user?.username||'there';
  unreadCount=0;
  profile?:CurrentStudentProfile; profileGender=''; profileSaving=false; profileSuccess='';

  ngOnInit():void{
    this.loadUnreadCount();
    if(this.auth.isStudent()){
      this.profileService.current().subscribe({next:p=>{this.profile=p;this.profileGender=p.gender||'';this.displayName=[p.firstName,p.lastName].filter(Boolean).join(' ')||this.displayName;this.cdr.markForCheck();},error:()=>{}});
      this.loadUpcoming();
    }
  }


  get needsProfileStep(): boolean {
    return this.auth.isStudent() && !!this.profile && !(this.profile.gender || '').trim();
  }

  saveProfileStep(): void {
    if (!this.profile || !this.profileGender || this.profileSaving) return;

    this.profileSaving = true;
    this.profileSuccess = '';

    this.profileService.updateCurrent(this.profile, { gender: this.profileGender })
      .pipe(finalize(() => {
        this.profileSaving = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: updated => {
          // Update local state immediately so the one-time setup card disappears
          // as soon as the backend confirms the save.
          this.profile = { ...updated, gender: updated.gender || this.profileGender };
          this.profileGender = this.profile.gender || this.profileGender;
          this.profileSuccess = 'Profile updated. Your hostel choices now match your eligibility.';
          this.cdr.markForCheck();
          window.setTimeout(() => {
            this.profileSuccess = '';
            this.cdr.markForCheck();
          }, 3500);
        },
        error: () => {
          this.profileSuccess = '';
        }
      });
  }

  get highlights(){
    return this.auth.isAdmin()
      ? [
          {label:'Management areas',value:this.modules.length.toString(),note:'Available in your workspace',icon:'dashboard'},
          {label:'Role',value:'Admin',note:'Campus operations access',icon:'shield'},
          {label:'Unread updates',value:this.unreadCount.toString(),note:'Notifications waiting',icon:'notifications'}
        ]
      : [
          {label:'Student services',value:this.modules.length.toString(),note:'Available in one place',icon:'dashboard'},
          {label:'Account',value:'Active',note:'Ready to use',icon:'shield'},
          {label:'Unread updates',value:this.unreadCount.toString(),note:'Notifications waiting',icon:'notifications'}
        ];
  }

  private loadUnreadCount():void{
    this.api.get<UnreadResponse>('Notification/my/unread-count').subscribe({next:r=>{this.unreadCount=r.unreadCount||0;this.cdr.markForCheck();},error:()=>{}});
  }

  private loadUpcoming():void{
    this.dashboardLoading=true;
    forkJoin({events:this.api.get<CampusEvent[]>('Event'),registrations:this.api.get<Registration[]>('EventRegistration/my')})
      .pipe(finalize(()=>{this.dashboardLoading=false;this.cdr.markForCheck();}))
      .subscribe({next:r=>{const activeIds=new Set(r.registrations.filter(x=>![3,4].includes(Number(x.status))).map(x=>x.eventId));this.upcomingEvents=r.events.filter(e=>activeIds.has(e.eventId)&&new Date(e.endDateTime).getTime()>Date.now()).sort((a,b)=>new Date(a.startDateTime).getTime()-new Date(b.startDateTime).getTime()).slice(0,3);},error:()=>{this.upcomingEvents=[];}});
  }

  formatDate(v:string):string{return new Date(v).toLocaleString([], {dateStyle:'medium',timeStyle:'short'});}
}
