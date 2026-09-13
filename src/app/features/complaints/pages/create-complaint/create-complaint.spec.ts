import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateComplaint } from './create-complaint';

describe('CreateComplaint', () => {
  let component: CreateComplaint;
  let fixture: ComponentFixture<CreateComplaint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateComplaint],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateComplaint);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
