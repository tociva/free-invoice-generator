import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { firstValueFrom, map, Observable, Subject, takeUntil } from 'rxjs';
import { TemplateService } from '../../../services/template.service';

import {
  addSearchTag,
  loadTemplates,
  removeSearchTag,
  setPagination,
  setSearchTags,
  setSelectedTemplate
} from '../../templates/store/actions/template.actions';
import { TemplateItem } from '../../templates/store/model/template.model';
import { selectTags } from '../../templates/store/selectors/tag.selectors';
import {
  selectFilteredTemplateItemCountAllConditions,
  selectPageSize,
  selectPaginatedTemplateItemsAllConditions,
  selectSearchTags,
} from '../../templates/store/selectors/template.selector';
import { TemplateState } from '../../templates/store/state/template.state';
import { TemplateUtil } from '../../util/template.util';
import { Invoice, TaxOption } from '../store/model/invoice.model';
import { selectInvoice } from '../store/selectors/invoice.selectors';
import { Router } from '@angular/router';

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
  readonly separatorKeysCodes = [ENTER, COMMA];
  private store = inject<Store<TemplateState>>(Store);
  private destroy$ = new Subject<void>();
  private safeHtmlMap: Record<string, SafeHtml> = {};

  tags$!: Observable<string[]>;
  selectedTags$!: Observable<string[]>;
  templates: TemplateItem[] = [];
  selectedTemplateId: string | null = null;


  downloadTemplateAsPDF = TemplateUtil.downloadTemplateAsPDF;
  downloadTemplateAsHTML = TemplateUtil.downloadTemplateAsHTML;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  itemsPerPage = 10;
  totalItems$ = this.store.select(selectFilteredTemplateItemCountAllConditions);

  constructor(
    private templateService: TemplateService,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.store.dispatch(loadTemplates());

    this.store
      .select(selectPageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe((pageSize) => {
        this.itemsPerPage = pageSize;
      });

    this.store
      .select(selectInvoice)
      .pipe(takeUntil(this.destroy$))
      .subscribe((invoice) => {
        const tagsU = SelectTemplateComponent.findTemplateTagFromInvoiceTaxType(invoice);
        if (tagsU) {
          this.store.dispatch(setSearchTags({ searchTags: tagsU }));
        }

        const excludedTags = ['cgst', 'sgst', 'igst', 'non-taxable'];
        this.tags$ = this.store.select(selectTags).pipe(
          map((tags) => tags.filter((tag) => !excludedTags.includes(tag)))
        );

        this.selectedTags$ = this.store.select(selectSearchTags).pipe(
          map((tags) => tags.filter((tag) => !excludedTags.includes(tag)))
        );

        this.store
          .select(selectPaginatedTemplateItemsAllConditions)
          .pipe(takeUntil(this.destroy$))
          .subscribe(async (templateItems) => {
            this.templates = templateItems;

            this.safeHtmlMap = {};
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
            this.templates = tmpls;
          });
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  findSafeHtml(path: string) {
    const rawHtml = this.safeHtmlMap[path] || '';
    return this.templateService.createWrappedSafeHtml(rawHtml as string);
  }

  // eslint-disable-next-line class-methods-use-this
  previewTemplate(_item: TemplateItem): void {
    // Implementation placeholder
  }

  removeTag(tag: string) {
    this.store.dispatch(removeSearchTag({ tag }));
  }

  addTag(event: MatChipInputEvent) {
    if (event.value?.trim()) {
      this.store.dispatch(addSearchTag({ tag: event.value.trim() }));
    }
  }

  selected(event: MatAutocompleteSelectedEvent) {
    this.store.dispatch(addSearchTag({ tag: event.option.value }));
  }
 onTemplateClick(template: TemplateItem): void {
  this.selectedTemplateId = template.path;
  this.store.dispatch(setSelectedTemplate({ selectedTemplate: template }));
  this.previewTemplate(template);
}

}
