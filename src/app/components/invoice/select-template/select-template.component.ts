import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import { filter, firstValueFrom, map, Observable, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { TemplateService } from '../../../services/template.service';

import {
  addSearchTag,
  loadTemplates,
  removeSearchTag,
  setPagination,
  setSearchTags,
  setSelectedTemplatePath,
} from '../../templates/store/actions/template.actions';
import { TemplateItem } from '../../templates/store/model/template.model';
import { selectTags } from '../../templates/store/selectors/tag.selectors';
import {
  selectFilteredTemplateItemCountAllConditions,
  selectPageSize,
  selectPaginatedTemplateItemsAllConditions,
  selectSearchTags,
  selectSelectedTemplatePath,
  selectTemplatesLoaded,
} from '../../templates/store/selectors/template.selector';
import { TemplateState } from '../../templates/store/state/template.state';
import { TemplateUtil } from '../../util/template.util';
import { Invoice, TaxOption } from '../store/model/invoice.model';
import { selectInvoice } from '../store/selectors/invoice.selectors';
import { MatStepper } from '@angular/material/stepper';
import { CloudDataService } from '../../../services/cloud-data.service';

@Component({
  selector: 'app-select-template',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
  ],
  templateUrl: './select-template.component.html',
  styleUrl: './select-template.component.scss',
})
export class SelectTemplateComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() stepper!: MatStepper;
  readonly separatorKeysCodes = [ENTER, COMMA];
  private store = inject<Store<TemplateState>>(Store);
  private destroy$ = new Subject<void>();

  tags$!: Observable<string[]>;
  selectedTags$!: Observable<string[]>;
  templates: TemplateItem[] = [];
  selectedTemplatePath: string | null = null;


  downloadTemplateAsPDF = TemplateUtil.downloadTemplateAsPDF;
  downloadTemplateAsHTML = TemplateUtil.downloadTemplateAsHTML;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  itemsPerPage = 10;
  totalItems$!:Observable<number>;

  constructor(
    private templateService: TemplateService,
    private http: HttpClient,
    private cloudDataService: CloudDataService
  ) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

  }
  ngOnInit(): void {
    this.store.select(selectTemplatesLoaded).pipe(
      take(1),
      filter((loaded) => !loaded)
    ).subscribe(() => {
      this.store.dispatch(loadTemplates());
    });
    
  
    this.totalItems$ = this.store.select(selectFilteredTemplateItemCountAllConditions).pipe(
      takeUntil(this.destroy$)
    );
  
    this.store.select(selectPageSize).pipe(
      takeUntil(this.destroy$)
    ).subscribe((pageSize) => {
      this.itemsPerPage = pageSize;
    });
  
    const excludedTags = ['cgst', 'sgst', 'igst', 'non-taxable'];
  
    this.tags$ = this.store.select(selectTags).pipe(
      takeUntil(this.destroy$),
      map((tags) => tags.filter((tag) => !excludedTags.includes(tag)))
    );
  
    this.selectedTags$ = this.store.select(selectSearchTags).pipe(
      takeUntil(this.destroy$),
      map((tags) => tags.filter((tag) => !excludedTags.includes(tag)))
    );
  
    this.store.select(selectInvoice).pipe(
      takeUntil(this.destroy$),
      tap((invoice) => {
        const tagsU = SelectTemplateComponent.findTemplateTagFromInvoiceTaxType(invoice);
        if (tagsU) {
          this.store.dispatch(setSearchTags({ searchTags: tagsU }));
        }
      }),
      switchMap((invoice) =>
        this.store.select(selectPaginatedTemplateItemsAllConditions).pipe(
          takeUntil(this.destroy$),
          switchMap(async (templateItems) => {
            this.templates = templateItems;
            const tmpls = await Promise.all(
              templateItems.map(async (item) => {
                const template = await firstValueFrom(
                  this.http.get(item.path, { responseType: 'text' })
                );
                const html = TemplateUtil.fillTemplate(template, invoice);
                const safeHTML = this.templateService.createWrappedSafeHtml(html);
                return { ...item, template, html, safeHTML };
              })
            );
            return tmpls;
          })
        )
      )
    ).subscribe((processedTemplates) => {
      this.templates = processedTemplates;
    });
  
    this.store.select(selectSelectedTemplatePath).pipe(
      takeUntil(this.destroy$)
    ).subscribe((selectedTemplatePath) => {
      this.selectedTemplatePath = selectedTemplatePath;
    });
  }
  

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.paginator.page.pipe(takeUntil(this.destroy$)).subscribe((event: PageEvent) => {
        const { pageIndex, pageSize } = event;
        this.store.dispatch(setPagination({ currentPage: pageIndex, pageSize }));
      });
    }
  }

  private static findTemplateTagFromInvoiceTaxType(invoice: Invoice): string[] | null {
    switch (invoice.taxOption) {
      case TaxOption.CGST_SGST:
        return ['cgst', 'sgst'];
      case TaxOption.IGST:
        return ['igst'];
      case TaxOption.NON_TAXABLE:
        return ['non-taxable'];
      default:
        return null;
    }
  }

   
  previewTemplate(item: TemplateItem): void {
  this.store.dispatch(setSelectedTemplatePath({ selectedTemplatePath: item.path }));
  
  // Move to the next step in the stepper
  if (this.stepper) {
    this.stepper.next();
  }
}


  removeTag(tag: string) {
    this.store.dispatch(removeSearchTag({ tag }));
    void this.cloudDataService.trackEvent(`removed-tag-in-template-list/${tag}`);
  }

  addTag(event: MatChipInputEvent) {
    if (event.value?.trim()) {
      this.store.dispatch(addSearchTag({ tag: event.value.trim() }));
      void this.cloudDataService.trackEvent(`added-tag-in-template-list/${event.value.trim()}`);
    }
  }

  selected(event: MatAutocompleteSelectedEvent) {
    this.store.dispatch(addSearchTag({ tag: event.option.value }));
    void this.cloudDataService.trackEvent(`selected-tag-in-template-list/${event.option.value}`);
  }

  onTemplateClick(template: TemplateItem): void {
    this.store.dispatch(setSelectedTemplatePath({ selectedTemplatePath: template.path }));
    void this.cloudDataService.trackEvent(`selected-template-in-template-list/${template.path}`);
  }

}
