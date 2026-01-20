import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal, OnInit, inject, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { InvoicePreviewDialogComponent } from '../invoice-preview-dialog/invoice-preview-dialog';
import { NgIcon } from '@ng-icons/core';
import { templateStore } from '../invoice/store/template/template.store';
import { sampleInvoice } from './template.utils';
import { TemplateUtil } from '../invoice/utils/templates.utils';
import { TemplateService } from '../invoice/store/services/template.services';
import { TemplateItem } from '../invoice/store/template/template.model';
import { ɵInternalFormsSharedModule } from "@angular/forms";

@Component({
  selector: 'app-list-templates',
  standalone: true,
  imports: [CommonModule, InvoicePreviewDialogComponent, NgIcon, ɵInternalFormsSharedModule],
  templateUrl: './list-templates.html',
  styleUrls: ['./list-templates.css'],
})
export class ListTemplates implements OnInit {

  templateService = inject(TemplateService);
  templateStore = inject(templateStore);
  private _http = inject(HttpClient);
  downloadTemplateAsPDF = TemplateUtil.downloadTemplateAsPDF;
  downloadTemplateAsHTML = TemplateUtil.downloadTemplateAsHTML;

  // SOURCE DATA
  templates = signal<TemplateItem[]>([]);

  // UI STATE
  globalSearch = signal('');
  showDropdown = signal(false);
  
 onInputClick(event: MouseEvent) {
    this.showDropdown.set(true);
    event.stopPropagation(); 
  }
   @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    this.showDropdown.set(false);
  }

  // PAGINATION
  itemsPerPage = signal(10);
  currentPage = signal(1);

  // PREVIEW
  previewDialogOpen = signal(false);
  previewTemplateHtml = signal<string | null>(null);
  previewTemplateName = signal('');

  // LOAD DATA
  async ngOnInit() {
    this.templateStore.loadTemplates();
  }

  eff = effect(() => {
    const items = this.templateStore.templateItems();
    if (!items.length) return;

    (async () => {
      const tmpls = await Promise.all(
        items.map(async (item) => {
          const template = await firstValueFrom(
            this._http.get(item.path, { responseType: 'text' })
          );

          const html = TemplateUtil.fillTemplate(template, sampleInvoice);
          const safeHTML = this.templateService.createWrappedSafeHtml(html);

          return { ...item, template, html, safeHTML };
        })
      );

      this.templates.set(tmpls);
    })();
  });
  filteredTags = computed(() => {
    const query = this.globalSearch().toLowerCase();
    return this.templateStore
      .searchTags()
      .filter(tag => tag.toLowerCase().includes(query));
  });

  
  filteredTemplatesTags = computed(() => {
    const q = this.globalSearch().toLowerCase().trim();
    if (!q) return this.templates();

    return this.templates().filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  });
  onInputChange(value: string) {
    this.globalSearch.set(value);
    this.showDropdown.set(this.filteredTags().length > 0);
  }

  displayedTemplates = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredTemplatesTags().slice(
      start,
      start + this.itemsPerPage()
    );
  });


  totalItems = computed(() => this.filteredTemplatesTags().length);
  pages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));
  startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage() + 1);
  endIndex = computed(() =>
    Math.min(this.currentPage() * this.itemsPerPage(), this.totalItems())
  );

  selectTag(tag: string): void {
    this.globalSearch.set(tag);
    this.showDropdown.set(false);
    this.currentPage.set(1);
  }

  clearSearch() {
    this.globalSearch.set('');
    this.currentPage.set(1);
  }

  previewTemplate(item: TemplateItem) {
    this.previewTemplateHtml.set(item.html);
    this.previewTemplateName.set(item.name);
    this.previewDialogOpen.set(true);
  }

  nextPage() {
    this.currentPage.update(p => Math.min(this.pages(), p + 1));
  }

  prevPage() {
    this.currentPage.update(p => Math.max(1, p - 1));
  }

  pageNumbers = computed(() => {
    const total = this.pages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];
    
    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (current > 3) {
        pages.push('...');
      }
      
      // Show pages around current
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (current < total - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(total);
    }
    
    return pages;
  });
 

  goToPage(page: number) {
    if (page >= 1 && page <= this.pages()) {
      this.currentPage.set(page);
      // Optimistic scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToFirstPage() {
    this.currentPage.set(1);
  }

  goToLastPage() {
    this.currentPage.set(this.pages());
  }

  isPageNumber(page: number | string): page is number {
    return typeof page === 'number';
  }

  handlePageClick(page: number | string) {
    if (this.isPageNumber(page)) {
      this.goToPage(page);
    }
  }
}
