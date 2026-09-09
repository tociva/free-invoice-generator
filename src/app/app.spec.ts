import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { testProviders } from './testing/test-providers';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')?.textContent).toContain('Free Invoice Generator');
  });
});
