import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleTable } from './role-table';

describe('RoleTable', () => {
  let component: RoleTable;
  let fixture: ComponentFixture<RoleTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleTable],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
