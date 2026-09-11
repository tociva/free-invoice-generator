import {
  TngButtonComponent,
  TngCardComponent,
  TngCommandPaletteComponent,
  TngEmptyComponent,
  TngProgressSpinnerComponent,
  TngSelectComponent,
} from '@tailng-ui/components';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TngIcon } from '@tailng-ui/icons';
import { invoiceStore } from '../store/invoice.store';
import { TemplateService } from '../store/services/template.services';
import { TemplateItem } from '../store/template/template.model';
import { templateStore } from '../store/template/template.store';

@Component({
  selector: 'app-select-template',
  standalone: true,
  imports: [
    TngEmptyComponent,
    TngSelectComponent,
    TngProgressSpinnerComponent,
    TngCardComponent,
    TngButtonComponent,
    TngCommandPaletteComponent,
    TngIcon,
  ],
  templateUrl: './select-template.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./select-template.css'],
})
export class SelectTemplateComponent {
  templateService = inject(TemplateService);
  templateStore = inject(templateStore);

  // SOURCE DATA
  // templates = signal<TemplateItem[]>([]);

  // UI STATE
  globalSearch = signal('');
  paletteQuery = signal('');
  searchOpen = signal(false);

  @HostListener('document:keydown', ['$event'])
  onGlobalSearchShortcut(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openSearch();
    }
  }

  openSearch(): void {
    this.paletteQuery.set('');
    this.searchOpen.set(true);
  }

  onSearchOpenChange(open: boolean): void {
    if (open) {
      this.paletteQuery.set('');
    }
    this.searchOpen.set(open);
  }

  onInputChange(value: string): void {
    this.paletteQuery.set(value);
  }

  getTagValue = (tag: string): string => tag;
  getTagLabel = (tag: string): string => tag;

  templates = input<TemplateItem[]>([]);
  selectedTemplate = input<TemplateItem | null>(null);
  templateSelected = output<TemplateItem>();
  isSelected = signal(false);

  selectTemplate(item: TemplateItem) {
    // this.selectedTemplate.set(item);
    // this.isSelected.set(true);
    this.templateSelected.emit(item);
  }
  filteredTags = computed(() => {
    const query = this.paletteQuery().toLowerCase();
    return this.templateStore
      .searchTags()
      .filter((tag) => tag.toLowerCase().includes(query) && !this.excludeTags().includes(tag));
  });
  excludeTags = signal<string[]>(['IGST', 'CGST & SGST', 'Non-Taxable']);

  store = inject(invoiceStore);
  invoice = this.store.invoice;
  // PAGINATION
  itemsPerPage = signal(10);
  currentPage = signal(1);

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
  pages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage())));
  startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage() + 1);
  endIndex = computed(() => Math.min(this.currentPage() * this.itemsPerPage(), this.totalItems()));

  selectTag(tag: string): void {
    this.globalSearch.set(tag);
    this.currentPage.set(1);
    this.searchOpen.set(false);
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
