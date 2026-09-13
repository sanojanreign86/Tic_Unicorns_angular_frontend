import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AppIconComponent } from '../../../shared/components/app-icon/app-icon';

interface Setting { settingId:number; key:string; value:string; description:string; isActive:boolean; }

@Component({
  selector:'app-admin-system-settings',
  standalone:true,
  imports:[CommonModule,FormsModule,AppIconComponent],
  templateUrl:'./admin-system-settings.html'
})
export class AdminSystemSettingsComponent implements OnInit {
  private readonly api=inject(ApiService);
  private readonly cdr=inject(ChangeDetectorRef);
  settings:Setting[]=[];
  holdMinutes=15;
  originalHoldMinutes=15;
  loading=true;
  saving=false;
  error='';
  success='';
  selected?:Setting;
  editModal=false;
  createModal=false;
  editForm={value:'',description:'',isActive:true};
  createForm={key:'',value:'',description:''};

  ngOnInit():void{this.load();}
  load():void{
    this.loading=true; this.error='';
    forkJoin({settings:this.api.get<Setting[]>('SystemSetting'),hold:this.api.get<number>('SystemSetting/reservation-hold-minutes')})
      .pipe(finalize(()=>{this.loading=false;this.cdr.markForCheck();}))
      .subscribe({
        next:r=>{this.settings=r.settings;this.holdMinutes=Number(r.hold)||15;this.originalHoldMinutes=this.holdMinutes;},
        error:e=>this.error=this.readError(e,'Unable to load system settings.')
      });
  }
  increment(delta:number):void{this.holdMinutes=Math.min(60,Math.max(1,Number(this.holdMinutes||1)+delta));}
  saveHold():void{
    if(this.holdMinutes<1||this.holdMinutes>60){this.error='Reservation hold duration must be between 1 and 60 minutes.';return;}
    this.saving=true;this.error='';
    this.api.put<number>('SystemSetting/reservation-hold-minutes',{minutes:Number(this.holdMinutes)})
      .pipe(finalize(()=>{this.saving=false;this.cdr.markForCheck();}))
      .subscribe({next:v=>{this.holdMinutes=Number(v)||this.holdMinutes;this.originalHoldMinutes=this.holdMinutes;this.success=`Reservation hold duration updated to ${this.holdMinutes} minutes.`;this.refreshSettingValue();},error:e=>this.error=this.readError(e,'Unable to update reservation hold duration.')});
  }
  private refreshSettingValue():void{this.settings=this.settings.map(s=>s.key.toLowerCase()==='reservationholdminutes'?{...s,value:String(this.holdMinutes)}:s);}
  openEdit(s:Setting):void{this.selected=s;this.editForm={value:s.value,description:s.description,isActive:s.isActive};this.editModal=true;this.error='';}
  saveEdit():void{
    if(!this.selected)return;
    this.saving=true;this.error='';
    this.api.put<Setting>(`SystemSetting/${this.selected.settingId}`,{value:this.editForm.value,description:this.editForm.description})
      .pipe(finalize(()=>{this.saving=false;this.cdr.markForCheck();}))
      .subscribe({next:u=>{this.settings=this.settings.map(s=>s.settingId===u.settingId?u:s);this.editModal=false;this.success=`${u.key} updated.`;},error:e=>this.error=this.readError(e,'Unable to update setting.')});
  }
  toggleActive(s:Setting):void{
    this.api.patch<Setting>(`SystemSetting/${s.settingId}/status`,{isActive:!s.isActive}).subscribe({next:u=>{this.settings=this.settings.map(x=>x.settingId===u.settingId?u:x);this.success=`${u.key} ${u.isActive?'activated':'deactivated'}.`;this.cdr.markForCheck();},error:e=>this.error=this.readError(e,'Unable to change setting status.')});
  }
  create():void{
    if(!this.createForm.key.trim()||!this.createForm.value.trim()){this.error='Key and value are required.';return;}
    this.saving=true;this.error='';
    this.api.post<Setting>('SystemSetting',this.createForm).pipe(finalize(()=>{this.saving=false;this.cdr.markForCheck();})).subscribe({next:s=>{this.settings=[...this.settings,s];this.createModal=false;this.createForm={key:'',value:'',description:''};this.success='Setting created.';},error:e=>this.error=this.readError(e,'Unable to create setting.')});
  }
  humanKey(key:string):string{return key.replace(/([A-Z])/g,' $1').trim().replace(/^./,c=>c.toUpperCase());}
  private readError(e:any,f:string):string{return e?.error?.message??(typeof e?.error==='string'?e.error:f);}
}
