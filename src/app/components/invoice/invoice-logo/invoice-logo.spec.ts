import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-providers';
import { InvoiceFormService } from '../store/models/invoice-form';
import { DEFAULT_INVOICE_LOGO_URL } from '../store/invoice.states';
import { InvoiceLogoComponent } from './invoice-logo';

describe('InvoiceLogoComponent', () => {
  let component: InvoiceLogoComponent;
  let fixture: ComponentFixture<InvoiceLogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [InvoiceLogoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceLogoComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('InvoiceLogo', TestBed.inject(InvoiceFormService).form);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays the default logo from the existing form control', () => {
    expect(component.InvoiceLogo().controls.smallLogo.value).toBe(DEFAULT_INVOICE_LOGO_URL);
    expect(
      fixture.nativeElement.querySelector('.app-invoice-logo-image')?.getAttribute('src'),
    ).toBe(DEFAULT_INVOICE_LOGO_URL);
  });

  it('keeps a removed default logo empty when the control is shown again', () => {
    const form = component.InvoiceLogo();

    component.removeImage();
    expect(form.controls.smallLogo.value).toBe('');

    fixture.destroy();
    fixture = TestBed.createComponent(InvoiceLogoComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('InvoiceLogo', form);
    fixture.detectChanges();

    expect(form.controls.smallLogo.value).toBe('');
    expect(fixture.nativeElement.querySelector('.app-invoice-logo-upload')).toBeTruthy();
  });

  it('replaces the default logo with an uploaded logo', () => {
    const replacement = 'data:image/png;base64,replacement-logo';
    vi.stubGlobal(
      'FileReader',
      class {
        result: string | ArrayBuffer | null = null;
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null;

        readAsDataURL() {
          this.result = replacement;
          this.onload?.(new ProgressEvent('load') as ProgressEvent<FileReader>);
        }
      },
    );

    component.onFilesReceived(new File(['logo'], 'replacement.png', { type: 'image/png' }));

    expect(component.InvoiceLogo().controls.smallLogo.value).toBe(replacement);
    expect(component.uploadedImageUrl()).toBe(replacement);
    vi.unstubAllGlobals();
  });
});
