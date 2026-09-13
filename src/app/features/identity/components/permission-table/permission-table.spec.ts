import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionTable } from './permission-table';

describe('PermissionTable', () => {
  let component: PermissionTable;
  let fixture: ComponentFixture<PermissionTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionTable],
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
