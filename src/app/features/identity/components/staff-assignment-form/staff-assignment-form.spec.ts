import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffAssignmentForm } from './staff-assignment-form';

describe('StaffAssignmentForm', () => {
  let component: StaffAssignmentForm;
  let fixture: ComponentFixture<StaffAssignmentForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffAssignmentForm],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffAssignmentForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
