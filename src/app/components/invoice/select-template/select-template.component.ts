import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
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
import { firstValueFrom, map, Observable } from 'rxjs';
import { TemplateService } from '../../../services/template.service';
import { addSearchTag, loadTemplates, removeSearchTag, setPagination, setSearchTags } from '../../templates/store/actions/template.actions';
import { TemplateItem } from '../../templates/store/model/template.model';
import { selectTags } from '../../templates/store/selectors/tag.selectors';
import {  selectFilteredTemplateItemCountAllConditions, selectPageSize, selectPaginatedTemplateItemsAllConditions, selectSearchTags } from '../../templates/store/selectors/template.selector';
import { TemplateState } from '../../templates/store/state/template.state';
import { TemplateUtil } from '../../util/template.util';
import { TaxOption } from '../store/model/invoice.model';
import { Invoice } from '../store/model/invoice.model';
import { selectInvoice } from '../store/selectors/invoice.selectors';

@Component({
  selector: 'app-select-template',
  imports: [CommonModule, FormsModule, MatPaginatorModule,
    MatInputModule,
  MatButtonModule, MatCardModule, MatIconModule, MatChipsModule, MatAutocompleteModule],
  templateUrl: './select-template.component.html',
  styleUrl: './select-template.component.scss',
  standalone: true
})
export class SelectTemplateComponent {

  readonly separatorKeysCodes = [ENTER, COMMA];
  private store = inject<Store<TemplateState>>(Store);
  private safeHtmlMap: Record<string, SafeHtml> = {};
  tags$!: Observable<string[]>;
  selectedTags$!: Observable<string[]>;
  templates: TemplateItem[] = [];
  downloadTemplateAsPDF = TemplateUtil.downloadTemplateAsPDF;
  downloadTemplateAsHTML = TemplateUtil.downloadTemplateAsHTML;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  itemsPerPage = 10;
  totalItems$ = this.store.select(selectFilteredTemplateItemCountAllConditions);

  constructor(
    private templateService: TemplateService,
    private http: HttpClient,
  ) {}

  private findTemplateTagFromInvoiceTaxType(invoice: Invoice): string[] | null {
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
  
  ngOnInit() {
    this.store.dispatch(loadTemplates());
  
    this.store.select(selectPageSize).subscribe((pageSize) => {
      this.itemsPerPage = pageSize;
    });

    this.store.select(selectInvoice).subscribe((invoice) => {
      const tags = this.findTemplateTagFromInvoiceTaxType(invoice);
      if (tags) {
        this.store.dispatch(setSearchTags({ searchTags: tags }));
        const excludedTags = ['cgst', 'sgst', 'igst', 'non-taxable'];
        this.tags$ = this.store.select(selectTags).pipe(
          map(allTags => allTags.filter(tag => !excludedTags.includes(tag)))
        );
        this.selectedTags$ = this.store.select(selectSearchTags).pipe(
          map(allTags => allTags.filter(tag => !excludedTags.includes(tag)))
        );
      }

      this.store.select(selectPaginatedTemplateItemsAllConditions).subscribe(async (templateItems) => {
        this.templates = templateItems;
    
        this.safeHtmlMap = {}; // clear existing
    
        // process all items in parallel
        const tmpls: TemplateItem[] = await Promise.all(
          templateItems.map(async (item) => {
            const template = await firstValueFrom(
              this.http.get(item.path, { responseType: 'text' })
            );
            const html = TemplateUtil.fillTemplate(template, invoice);
  
            const safeHTML = this.templateService.createWrappedSafeHtml(html);
    
            return {
              ...item,
              template,
              html,
              safeHTML,
            };
          })
        );
    
        this.templates = tmpls;
      });
    });
    
  }
  
  ngAfterViewInit() {
    if (this.paginator) {
      this.paginator.page.subscribe((event: PageEvent) => {
        const { pageIndex, pageSize } = event;
        this.store.dispatch(setPagination({ currentPage: pageIndex, pageSize }));
      });
    }
  }

  findSafeHtml(path: string) {
    const rawHtml = this.safeHtmlMap[path] || '';
    return this.templateService.createWrappedSafeHtml(rawHtml as string);
  }
   
  previewTemplate(item: TemplateItem): void {
    
  }

  removeTag(tag: string) {
    this.store.dispatch(removeSearchTag({ tag }));
  }

  addTag(event: MatChipInputEvent) {
    this.store.dispatch(addSearchTag({ tag: event.value }));
  }

  selected(event: MatAutocompleteSelectedEvent) {
    this.store.dispatch(addSearchTag({ tag: event.option.value }));
  }
    
}
