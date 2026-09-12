import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import {
  Certificate,
  CreateCertificateRequest,
  UpdateCertificateRequest,
  UpdateCertificateStatusRequest
} from '../models/certificate-request.model';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

    private certificates: Certificate[] = [
        {
          certificateId: 1,
          studentId: 1001,
          certificateType: 'Bonafide',
          purpose: 'For scholarship application',
          status: 'Pending',
          requestedAt: '2026-09-10T08:30:00',
          processedAt: null,
          rejectionReason: null,
          documentPath: null
        },
        {
          certificateId: 2,
          studentId: 1001,
          certificateType: 'CourseCompletion',
          purpose: 'For job application',
          status: 'Processing',
          requestedAt: '2026-09-08T10:15:00',
          processedAt: '2026-09-09T12:00:00',
          rejectionReason: null,
          documentPath: null
        },
        {
          certificateId: 3,
          studentId: 1001,
          certificateType: 'Character',
          purpose: 'For higher studies',
          status: 'Done',
          requestedAt: '2026-09-05T09:00:00',
          processedAt: '2026-09-07T14:30:00',
          rejectionReason: null,
          documentPath: '/documents/character-certificate.pdf'
        },
        {
          certificateId: 4,
          studentId: 1001,
          certificateType: 'Transcript',
          purpose: 'For university application',
          status: 'Rejected',
          requestedAt: '2026-09-03T11:20:00',
          processedAt: '2026-09-04T15:00:00',
          rejectionReason: 'Additional information is required',
          documentPath: null
        }
      ];
  getCertificates(): Observable<Certificate[]> {
    return of(this.certificates);
  }

  getCertificateById(id: number): Observable<Certificate | undefined> {
    const certificate = this.certificates.find(
      certificate => certificate.certificateId === id
    );

    return of(certificate);
  }

  createCertificate(
    request: CreateCertificateRequest
  ): Observable<Certificate> {

    const newCertificate: Certificate = {
      certificateId: this.certificates.length + 1,
      studentId: request.studentId,
      certificateType: request.certificateType,
      purpose: request.purpose,
      status: 'Pending',
      requestedAt: new Date().toISOString(),
      processedAt: null,
      rejectionReason: null,
      documentPath: null
    };

    this.certificates.push(newCertificate);

    return of(newCertificate);
  }

  updateCertificate(
    id: number,
    request: UpdateCertificateRequest
  ): Observable<Certificate | undefined> {

    const certificate = this.certificates.find(
      certificate => certificate.certificateId === id
    );

    if (!certificate) {
      return of(undefined);
    }

    certificate.certificateType = request.certificateType;
    certificate.purpose = request.purpose;

    return of(certificate);
  }

  updateCertificateStatus(
    id: number,
    request: UpdateCertificateStatusRequest
  ): Observable<Certificate | undefined> {

    const certificate = this.certificates.find(
      certificate => certificate.certificateId === id
    );

    if (!certificate) {
      return of(undefined);
    }

    certificate.status = request.status;
    certificate.rejectionReason = request.rejectionReason ?? null;

    if (
      request.status === 'Processing' ||
      request.status === 'Done'
    ) {
      certificate.processedAt = new Date().toISOString();
    }

    return of(certificate);
  }

  deleteCertificate(id: number): Observable<boolean> {
    const index = this.certificates.findIndex(
      certificate => certificate.certificateId === id
    );

    if (index === -1) {
      return of(false);
    }

    this.certificates.splice(index, 1);

    return of(true);
  }
}