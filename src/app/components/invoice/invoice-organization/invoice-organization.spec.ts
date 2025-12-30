import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceOrganizationComponent } from './invoice-organization';

describe('InvoiceOrganizationComponent', () => {
  let component: InvoiceOrganizationComponent;
  let fixture: ComponentFixture<InvoiceOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceOrganizationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
