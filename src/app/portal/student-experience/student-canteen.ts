import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon';
interface Canteen{canteenId:number;hostelId:number;canteenName:string;description?:string|null;isActive:boolean;}
interface MealPackage{mealPackageId:number;canteenId?:number|null;canteenName:string;packageName:string;packageCode?:string;planType:string;billingPeriod:string;breakfastIncluded:boolean;lunchIncluded:boolean;dinnerIncluded:boolean;price:number;isActive:boolean;}
interface Subscription{mealSubscriptionId:number;canteenName:string;packageName:string;planType:string;billingPeriod:string;startDate:string;endDate:string;amount:number;status:number|string;paymentStatus:string;paymentReference?:string|null;paidAt?:string|null;unusedDays:number;carryForwardDays:number;}
interface Usage{mealDate:string;mealType:number|string;status:number|string;collectedAt?:string|null;}
interface Menu{menuItemId:number;itemName:string;description?:string|null;mealType:number|string;price:number;isAvailable:boolean;}
@Component({selector:'app-student-canteen',standalone:true,imports:[CommonModule,FormsModule,RouterLink,AppIconComponent],templateUrl:'./student-canteen.html'})
export class StudentCanteenComponent implements OnInit{
 private readonly api=inject(ApiService);private readonly cdr=inject(ChangeDetectorRef);
 canteens:Canteen[]=[];packages:MealPackage[]=[];subscriptions:Subscription[]=[];usage:Usage[]=[];menu:Menu[]=[];
 activeView:'plans'|'subscriptions'|'usage'='plans';selectedCanteen?:Canteen;selectedPackage?:MealPackage;startDate=new Date(Date.now()+86400000).toISOString().slice(0,10);
 loading=true;actionLoading=false;blocked=false;blockedMessage='';error='';success='';pendingSubscription?:Subscription;absenceModal=false;absenceSubscription?:Subscription;absenceForm={fromDate:'',toDate:'',reason:''};
 ngOnInit():void{this.load();}
 load():void{
   this.loading=true;this.blocked=false;this.error='';
   const canteens$=this.api.get<Canteen[]>('canteen/my/canteens').pipe(catchError(e=>{if(e?.status===409){this.blocked=true;this.blockedMessage=this.readError(e,'Meal plans become available after an active hostel allocation is assigned.');return of([] as Canteen[]);}throw e;}));
   forkJoin({canteens:canteens$,packages:this.api.get<MealPackage[]>('canteen/packages'),subscriptions:this.api.get<Subscription[]>('canteen/my/subscriptions'),usage:this.api.get<Usage[]>('canteen/my/usage')})
     .pipe(finalize(()=>{this.loading=false;this.cdr.markForCheck();}))
     .subscribe({next:r=>{this.canteens=r.canteens.filter(c=>c.isActive);this.packages=r.packages.filter(p=>p.isActive);this.subscriptions=r.subscriptions;this.usage=r.usage;},error:e=>this.error=this.readError(e,'Unable to load canteen information.')});
 }
 get visiblePackages():MealPackage[]{if(!this.selectedCanteen)return[];return this.packages.filter(p=>!p.canteenId||p.canteenId===this.selectedCanteen?.canteenId);}
 selectCanteen(c:Canteen):void{this.selectedCanteen=c;this.selectedPackage=undefined;this.pendingSubscription=undefined;this.menu=[];this.error='';this.api.get<Menu[]>(`canteen/canteens/${c.canteenId}/menu`).subscribe({next:m=>{this.menu=m.filter(x=>x.isAvailable);this.cdr.markForCheck();},error:()=>{this.menu=[];}});}
 selectPackage(p:MealPackage):void{this.selectedPackage=p;this.pendingSubscription=undefined;this.error='';}
 subscribe():void{if(!this.selectedPackage||!this.startDate)return;this.actionLoading=true;this.error='';this.api.post<Subscription>('canteen/subscriptions',{mealPackageId:this.selectedPackage.mealPackageId,startDate:this.startDate}).pipe(finalize(()=>{this.actionLoading=false;this.cdr.markForCheck();})).subscribe({next:s=>{this.pendingSubscription=s;this.subscriptions=[s,...this.subscriptions];this.success='Meal plan created. Complete payment to activate it.';},error:e=>this.error=this.readError(e,'Unable to create the meal subscription.')});}
 pay(subscription:Subscription):void{this.actionLoading=true;this.error='';this.api.post<Subscription>(`canteen/subscriptions/${subscription.mealSubscriptionId}/pay`,{paymentReference:`SIM-MEAL-${subscription.mealSubscriptionId}-${Date.now()}`}).pipe(finalize(()=>{this.actionLoading=false;this.cdr.markForCheck();})).subscribe({next:s=>{this.pendingSubscription=s;this.subscriptions=this.subscriptions.map(x=>x.mealSubscriptionId===s.mealSubscriptionId?s:x);this.success='Meal plan payment completed.';},error:e=>this.error=this.readError(e,'Unable to complete meal plan payment.')});}
 openAbsence(s:Subscription):void{this.absenceSubscription=s;const tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,10);this.absenceForm={fromDate:tomorrow,toDate:tomorrow,reason:''};this.absenceModal=true;}
 reportAbsence():void{if(!this.absenceSubscription||!this.absenceForm.fromDate||!this.absenceForm.toDate)return;this.actionLoading=true;this.api.post('canteen/absences',{mealSubscriptionId:this.absenceSubscription.mealSubscriptionId,fromDate:this.absenceForm.fromDate,toDate:this.absenceForm.toDate,reason:this.absenceForm.reason||null}).pipe(finalize(()=>{this.actionLoading=false;this.cdr.markForCheck();})).subscribe({next:()=>{this.absenceModal=false;this.success='Meal absence reported. Your unused-day/carry-forward rules will be applied by the service.';},error:e=>this.error=this.readError(e,'Unable to report meal absence.')});}
 subscriptionStatus(v:number|string):string{if(typeof v==='string'&&isNaN(Number(v)))return v;return({1:'Pending',2:'Active',3:'Expired',4:'Cancelled'} as Record<number,string>)[Number(v)]??String(v);} mealTypeLabel(v:number|string):string{if(typeof v==='string'&&isNaN(Number(v)))return v;return({1:'Breakfast',2:'Lunch',3:'Dinner'} as Record<number,string>)[Number(v)]??'Meal';} usageStatusLabel(v:number|string):string{if(typeof v==='string'&&isNaN(Number(v)))return v;return({1:'Eligible',2:'Collected',3:'Missed',4:'Cancelled'} as Record<number,string>)[Number(v)]??String(v);}
 planLabel(p:MealPackage):string{if(p.planType==='FB')return'Full meal plan';if(p.planType==='HB')return'Breakfast + dinner plan';if(p.planType==='BB')return'Breakfast plan';return p.packageName||'Meal plan';}
 meals(p:MealPackage):string{const m=[];if(p.breakfastIncluded)m.push('Breakfast');if(p.lunchIncluded)m.push('Lunch');if(p.dinnerIncluded)m.push('Dinner');return m.join(' + ')||'Meals as scheduled';} formatDate(v:string):string{return new Date(v).toLocaleDateString([], {day:'2-digit',month:'short',year:'numeric'});} private readError(e:any,f:string):string{return e?.error?.message??(typeof e?.error==='string'?e.error:f);}
}
