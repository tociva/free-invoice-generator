import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-providers';
import { SelectTemplateComponent } from './select-template';

describe('SelectTemplateComponent', () => {
  let component: SelectTemplateComponent;
  let fixture: ComponentFixture<SelectTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [SelectTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
