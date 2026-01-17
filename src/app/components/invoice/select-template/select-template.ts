import { Component, OnInit, signal, computed, effect, output, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { NgIcon } from '@ng-icons/core';
import { TemplateUtil } from '../utils/templates.utils';
import { TemplateService } from '../store/services/template.services';
import { templateStore } from '../store/template/template.store';
import { sampleInvoice } from '../../list-templates/template.utils';
import { TemplateItem } from '../store/template/template.model';
import { invoiceStore } from '../store/invoice.store';

@Component({
  selector: 'app-select-template',
  standalone: true,
  imports: [NgIcon],
  templateUrl: './select-template.html',
  styleUrls: ['./select-template.css'],
})
export class SelectTemplateComponent implements OnInit {
  templateService = inject(TemplateService);
  templateStore = inject(templateStore);
  private _http = inject(HttpClient);

  // SOURCE DATA
  templates = signal<TemplateItem[]>([]);

  // UI STATE
  globalSearch = signal('');
  searchFocused = signal(false);

  showSuggestion = computed(() => this.searchFocused() && this.globalSearch().length > 0);
  onShow() {
    this.searchFocused.set(true);
  }
  selectedTemplate = signal<TemplateItem | null>(null);
  templateSelected = output<TemplateItem>();
  isSelected = signal(false);

  selectTemplate(item: TemplateItem) {
    this.selectedTemplate.set(item);
    this.isSelected.set(true);
    this.templateSelected.emit(item);
    console.log(item);
  }

  store = inject(invoiceStore);
  invoice = this.store.invoice;
  // PAGINATION
  itemsPerPage = signal(10);
  currentPage = signal(1);

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
            this._http.get(item.path, { responseType: 'text' }),
          );

          // const html = TemplateUtil.fillTemplate(template,sampleInvoice);
          const safeHTML = this.templateService.createWrappedSafeHtml(template);

          return { ...item, template, html: template, safeHTML };
        }),
      );

      this.templates.set(tmpls);
    })();
  });

  filteredTemplates = computed(() => {
    const q = this.globalSearch().toLowerCase().trim();
    if (!q) return this.templates();

    return this.templates().filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(q)),
    );
  });

  displayedTemplates = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredTemplates().slice(start, start + this.itemsPerPage());
  });

  totalItems = computed(() => this.filteredTemplates().length);
  pages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));
  startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage() + 1);
  endIndex = computed(() => Math.min(this.currentPage() * this.itemsPerPage(), this.totalItems()));

  selectTag(tag: string): void {
    this.globalSearch.set(tag);
    this.searchFocused.set(false);
    this.currentPage.set(1);
  }

  clearSearch() {
    this.globalSearch.set('');
    this.currentPage.set(1);
  }

  nextPage() {
    this.currentPage.update((p) => Math.min(this.pages(), p + 1));
  }

  prevPage() {
    this.currentPage.update((p) => Math.max(1, p - 1));
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
