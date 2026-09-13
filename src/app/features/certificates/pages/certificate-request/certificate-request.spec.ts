import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateRequest } from './certificate-request';

describe('CertificateRequest', () => {
  let component: CertificateRequest;
  let fixture: ComponentFixture<CertificateRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(CertificateRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
