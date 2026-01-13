import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Testing } from './testing';

describe('Testing', () => {
  let component: Testing;
  let fixture: ComponentFixture<Testing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Testing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Testing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
