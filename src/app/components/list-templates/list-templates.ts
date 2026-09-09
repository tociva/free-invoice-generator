import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { TngButtonComponent, TngInputFieldComponent } from '@tailng-ui/components';
import { TngInput } from '@tailng-ui/primitives';
import { InvoicePreviewDialogComponent } from '../invoice-preview-dialog/invoice-preview-dialog';
import { TemplateService } from '../invoice/store/services/template.services';
import { TemplateItem } from '../invoice/store/template/template.model';
import { templateStore } from '../invoice/store/template/template.store';
import { TemplateUtil } from '../invoice/utils/templates.utils';
import { sampleInvoice } from './template.utils';

@Component({
  selector: 'app-list-templates',
  standalone: true,
  imports: [
    TngButtonComponent,
    TngInputFieldComponent,
    TngInput,
    CommonModule,
    InvoicePreviewDialogComponent,
    NgIcon,
    FormsModule,
  ],
  templateUrl: './list-templates.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./list-templates.css'],
})
export class ListTemplates implements OnInit {
  templateService = inject(TemplateService);
  templateStore = inject(templateStore);
  downloadTemplateAsPDF = (item: TemplateItem) =>
    TemplateUtil.downloadTemplateAsPDF({
      ...item,
      html: TemplateUtil.fillTemplate(item.html ?? '', sampleInvoice),
    });
  downloadTemplateAsHTML = (item: TemplateItem) =>
    TemplateUtil.downloadTemplateAsHTML({
      ...item,
      html: TemplateUtil.fillTemplate(item.html ?? '', sampleInvoice),
    });

  // SOURCE DATA
  templates = computed(() => this.templateStore.templateItems());

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

  filteredTags = computed(() => {
    const query = this.globalSearch().toLowerCase();
    return this.templateStore.searchTags().filter((tag) => tag.toLowerCase().includes(query));
  });

  filteredTemplatesTags = computed(() => {
    const q = this.globalSearch().toLowerCase().trim();
    if (!q) return this.templates();

    return this.templates().filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(q)),
    );
  });
  onInputChange(value: string) {
    this.globalSearch.set(value);
    this.currentPage.set(1);
    this.showDropdown.set(this.filteredTags().length > 0);
  }

  displayedTemplates = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredTemplatesTags().slice(start, start + this.itemsPerPage());
  });

  totalItems = computed(() => this.filteredTemplatesTags().length);
  pages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage())));
  startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage() + 1);
  endIndex = computed(() => Math.min(this.currentPage() * this.itemsPerPage(), this.totalItems()));

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
    this.previewTemplateHtml.set(TemplateUtil.fillTemplate(item.html ?? '', sampleInvoice));
    this.previewTemplateName.set(item.name);
    this.previewDialogOpen.set(true);
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

  changePageSize(value: string) {
    this.itemsPerPage.set(Number(value));
    this.currentPage.set(1);
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
