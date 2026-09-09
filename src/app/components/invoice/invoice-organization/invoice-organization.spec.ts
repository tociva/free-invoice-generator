import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-providers';
import { InvoiceFormService } from '../store/models/invoice-form';
import { InvoiceOrganizationComponent } from './invoice-organization';

describe('InvoiceOrganizationComponent', () => {
  let component: InvoiceOrganizationComponent;
  let fixture: ComponentFixture<InvoiceOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [InvoiceOrganizationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceOrganizationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'InvoiceOrganizationForm',
      TestBed.inject(InvoiceFormService).form.controls.organization,
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
