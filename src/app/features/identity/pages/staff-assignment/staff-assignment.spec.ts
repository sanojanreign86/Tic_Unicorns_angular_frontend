import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffAssignment } from './staff-assignment';

describe('StaffAssignment', () => {
  let component: StaffAssignment;
  let fixture: ComponentFixture<StaffAssignment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffAssignment],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffAssignment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
