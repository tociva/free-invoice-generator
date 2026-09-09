import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-providers';
import { PreviewInvoiceComponent } from './preview-invoice';

describe('PreviewInvoiceComponent', () => {
  let component: PreviewInvoiceComponent;
  let fixture: ComponentFixture<PreviewInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [PreviewInvoiceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PreviewInvoiceComponent);
    component = fixture.componentInstance;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
