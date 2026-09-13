import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon';
interface CampusNotification{notificationId:number;title:string;message:string;isRead:boolean;referenceType:string;referenceId:number;createdAt:string;}
@Component({selector:'app-student-notifications',standalone:true,imports:[CommonModule,AppIconComponent],templateUrl:'./student-notifications.html'})
export class StudentNotificationsComponent implements OnInit{
 private readonly api=inject(ApiService);private readonly cdr=inject(ChangeDetectorRef);private readonly router=inject(Router);items:CampusNotification[]=[];loading=true;actionLoading=false;error='';filter:'all'|'unread'='all';
 ngOnInit():void{this.load();}load():void{this.loading=true;this.error='';this.api.get<CampusNotification[]>('Notification/my').pipe(finalize(()=>{this.loading=false;this.cdr.markForCheck();})).subscribe({next:n=>this.items=n,error:e=>this.error=this.readError(e,'Unable to load notifications.')});}
 get visible():CampusNotification[]{return this.filter==='unread'?this.items.filter(n=>!n.isRead):this.items;}get unreadCount():number{return this.items.filter(n=>!n.isRead).length;}
 markRead(n:CampusNotification):void{if(n.isRead){this.openReference(n);return;}this.actionLoading=true;this.api.put(`Notification/${n.notificationId}/read`,{}).pipe(finalize(()=>{this.actionLoading=false;this.cdr.markForCheck();})).subscribe({next:()=>{n.isRead=true;this.notifyBadgeChanged();this.openReference(n);},error:e=>this.error=this.readError(e,'Unable to mark notification as read.')});}
 markAll():void{this.actionLoading=true;this.api.put('Notification/read-all',{}).pipe(finalize(()=>{this.actionLoading=false;this.cdr.markForCheck();})).subscribe({next:()=>{this.items=this.items.map(n=>({...n,isRead:true}));this.notifyBadgeChanged();},error:e=>this.error=this.readError(e,'Unable to mark notifications as read.')});}

 deleteItem(n:CampusNotification):void{if(!confirm('Remove this notification?'))return;this.actionLoading=true;this.api.delete(`Notification/${n.notificationId}`).pipe(finalize(()=>{this.actionLoading=false;this.cdr.markForCheck();})).subscribe({next:()=>{this.items=this.items.filter(x=>x.notificationId!==n.notificationId);this.notifyBadgeChanged();},error:e=>this.error=this.readError(e,'Unable to delete notification.')});}
 openReference(n:CampusNotification):void{const t=n.referenceType?.toLowerCase()||'';const route=t.includes('event')?'events':t.includes('lab')?'labs':t.includes('hostel')?'hostels':t.includes('canteen')||t.includes('meal')?'canteen':t.includes('certificate')?'certificates':t.includes('complaint')?'complaints':t.includes('fee')?'fees':t.includes('gym')?'gym':t.includes('leave')?'leave':t.includes('sport')?'sports':null;if(route)void this.router.navigate(['/portal',route]);}
 notifyBadgeChanged():void{window.dispatchEvent(new Event('campus-notifications-changed'));}
 formatDate(v:string):string{return new Date(v).toLocaleString([], {dateStyle:'medium',timeStyle:'short'});}private readError(e:any,f:string):string{return e?.error?.message??(typeof e?.error==='string'?e.error:f);}
}
