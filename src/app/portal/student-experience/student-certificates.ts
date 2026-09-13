import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon';

interface CertificateRequest { certificateId:number; certificateType:string; purpose:string; status:string; requestedAt:string; processedAt?:string|null; rejectionReason?:string|null; documentPath?:string|null; }
@Component({selector:'app-student-certificates',standalone:true,imports:[CommonModule,FormsModule,AppIconComponent],templateUrl:'./student-certificates.html'})
export class StudentCertificatesComponent implements OnInit {
  private readonly api=inject(ApiService);private readonly cdr=inject(ChangeDetectorRef);
  requests:CertificateRequest[]=[];activeView:'request'|'history'='request';certificateType='';purpose='';loading=true;actionLoading=false;error='';success='';
  readonly types=[{value:'Bonafide',label:'Bonafide Certificate'},{value:'Transcript',label:'Academic Transcript'},{value:'CompletionLetter',label:'Completion Letter'}];
  ngOnInit():void{this.load();}
  load():void{this.loading=true;this.api.get<CertificateRequest[]>('Certificates/my').pipe(finalize(()=>{this.loading=false;this.cdr.markForCheck();})).subscribe({next:r=>this.requests=r,error:e=>this.error=this.readError(e,'Unable to load certificate requests.')});}
  submit():void{if(!this.certificateType||!this.purpose.trim()){this.error='Choose a certificate type and enter the purpose.';return;}this.actionLoading=true;this.error='';this.api.post<CertificateRequest>('Certificates',{certificateType:this.certificateType,purpose:this.purpose.trim()}).pipe(finalize(()=>{this.actionLoading=false;this.cdr.markForCheck();})).subscribe({next:r=>{this.requests=[r,...this.requests];this.success='Certificate request submitted successfully.';this.certificateType='';this.purpose='';this.activeView='history';},error:e=>this.error=this.readError(e,'Unable to submit the certificate request.')});}
  formatDate(v:string):string{return new Date(v).toLocaleString([], {dateStyle:'medium',timeStyle:'short'});} private readError(e:any,f:string):string{return e?.error?.message??(typeof e?.error==='string'?e.error:f);}
}
