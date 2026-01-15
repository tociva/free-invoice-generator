import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal, output, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { InvoicePreviewDialogComponent } from '../invoice-preview-dialog/invoice-preview-dialog';
import { NgIcon } from '@ng-icons/core';

type TemplateItem = {
  id: string;
  name: string;
  description: string;
  path: string;
  html: string;
  safeHTML?: SafeHtml;
  tags?: string[];
  thumbnail?: string;
};

type TemplateTheme = {
  theme: string;
  name: string;
  description: string;
  items: Array<{
    name: string;
    path: string;
    tags?: string[];
    thumbnail?: string;
  }>;
};

@Component({
  selector: 'app-list-templates',
  standalone: true,
  imports: [CommonModule, InvoicePreviewDialogComponent,NgIcon],
  templateUrl: './list-templates.html',
  styleUrls: ['./list-templates.css'],
})
export class ListTemplates implements OnInit {
  templates = signal<TemplateItem[]>([]);
  loading = signal<boolean>(true);
  initialLoadComplete = signal<boolean>(false);
  
  // global search box (top center)
  globalSearch = signal('');
  searchFocused = signal(false);

  // pagination
  itemsPerPage = signal(10);
  currentPage = signal(1);

  // preview dialog
  previewDialogOpen = signal<boolean>(false);
  previewTemplateHtml = signal<string | null>(null);
  previewTemplateName = signal<string>('');

  // outputs
  selectedChange = output<string | null>();

  // filtered by global search
  filteredTemplates = computed(() => {
    const q = this.globalSearch().toLowerCase();
    if (!q) return this.templates();
    return this.templates().filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.description.toLowerCase().includes(q) ||
      t.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  });

  totalItems = computed(() => this.filteredTemplates().length);

  pagedTemplates = computed(() => {
    const list = this.filteredTemplates();
    const page = this.currentPage();
    const per = this.itemsPerPage();
    const start = (page - 1) * per;
    return list.slice(start, start + per);
  });

  pages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage())));

  startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage() + 1);
  endIndex = computed(() => Math.min(this.currentPage() * this.itemsPerPage(), this.totalItems()));

  // Get page numbers to display (show current page and nearby pages)
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

  constructor(
    private sanitizer: DomSanitizer,
    private _http: HttpClient
  ) {
    effect(() => {
      // reset page if current page is out of range
      const pages = Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage()));
      if (this.currentPage() > pages) this.currentPage.set(pages);
    });
  }

  async ngOnInit() {
    await this.loadTemplates();
  }

  async loadTemplates() {
    try {
      this.loading.set(true);
      const themes: TemplateTheme[] = await firstValueFrom(
        this._http.get<TemplateTheme[]>('/invoice-templates/templates.json')
      ) || [];
      
      // Flatten all template items first (optimistic - show structure immediately)
      const allTemplateItems: Array<{ theme: TemplateTheme; item: TemplateTheme['items'][0] }> = [];
      for (const theme of themes) {
        for (const item of theme.items) {
          allTemplateItems.push({ theme, item });
        }
      }
      
      // Set initial empty templates with structure (optimistic UI)
      this.templates.set(
        allTemplateItems.map(({ theme, item }) => ({
          id: `${theme.theme}-${item.name}`,
          name: item.name,
          description: theme.description,
          path: item.path,
          html: '',
          safeHTML: undefined,
          tags: item.tags,
          thumbnail: item.thumbnail,
        }))
      );
      
      // Mark initial load as complete (show skeleton cards)
      this.initialLoadComplete.set(true);
      this.loading.set(false);
      
      // Load HTML content progressively (optimistic - show cards immediately)
      const loadPromises = allTemplateItems.map(async ({ theme, item }, index) => {
        try {
          const html = await firstValueFrom(
            this._http.get(`/${item.path}`, { responseType: 'text' })
          ) || '';
          
          // Inject CSS to hide scrollbars in the template HTML
          let htmlWithNoScroll = html;
          const noScrollStyle = '<style>body { overflow: hidden !important; } html { overflow: hidden !important; }</style>';
          
          if (html.includes('</head>')) {
            htmlWithNoScroll = html.replace('</head>', noScrollStyle + '</head>');
          } else if (html.includes('<head>')) {
            htmlWithNoScroll = html.replace('<head>', '<head>' + noScrollStyle);
          } else {
            htmlWithNoScroll = noScrollStyle + html;
          }
          
          // Update template optimistically as it loads
          this.templates.update(templates => {
            const updated = [...templates];
            if (updated[index]) {
              updated[index] = {
                ...updated[index],
                html: html,
                safeHTML: this.sanitizer.bypassSecurityTrustHtml(htmlWithNoScroll),
              };
            }
            return updated;
          });
        } catch (error) {
          console.warn(`Failed to load template: ${item.path}`, error);
        }
      });
      
      // Wait for all templates to load (but UI is already showing)
      await Promise.all(loadPromises);
    } catch (error) {
      console.error('Failed to load templates:', error);
      this.loading.set(false);
    }
  }

  selectTemplate(id: string) {
    this.selectedChange.emit(id);
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

  handleDownload() {
    // Handle download logic
    console.log('Download template:', this.previewTemplateName());
  }

  handlePrint() {
    // Handle print logic
    window.print();
  }

  downloadTemplateAsPDF(item: TemplateItem): void {
    // Dynamically import html2canvas and jsPDF
    // Promise.all([
    //   import('html2canvas'),
    //   import('jspdf')
    // ]).then(([html2canvasModule, jsPDFModule]) => {
    //   const html2canvas = html2canvasModule.default;
    //   const jsPDF = jsPDFModule.default;

    //   const container = document.createElement('div');
    //   container.innerHTML = item.html;
    //   container.style.position = 'fixed';
    //   container.style.top = '0';
    //   container.style.left = '0';
    //   container.style.width = '800px';
    //   container.style.padding = '20px';
    //   container.style.background = 'white';
    //   container.style.zIndex = '-1';
    //   document.body.appendChild(container);

    //   html2canvas(container, {
    //     scale: 2,
    //     useCORS: true
    //   }).then((canvas) => {
    //     const imgData = canvas.toDataURL('image/jpeg', 1.0);

    //     const pdf = new jsPDF('p', 'mm', 'a4');
    //     const pageWidth = pdf.internal.pageSize.getWidth();
    //     const pageHeight = pdf.internal.pageSize.getHeight();

    //     const imgWidth = pageWidth;
    //     const imgHeight = (canvas.height * imgWidth) / canvas.width;

    //     let heightLeft = imgHeight;
    //     let position = 0;

    //     pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    //     heightLeft -= pageHeight;

    //     while (heightLeft > 1) {
    //       position -= pageHeight;
    //       pdf.addPage();
    //       pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    //       heightLeft -= pageHeight;
    //     }

    //     pdf.save(`${item.name}.pdf`);
    //     document.body.removeChild(container);
    //   }).catch((err) => {
    //     console.error('Error generating PDF:', err);
    //     document.body.removeChild(container);
    //     alert('Failed to generate PDF. Please try again.');
    //   });
    // }).catch((err) => {
    //   console.error('Error loading PDF libraries:', err);
    //   alert('Failed to load PDF libraries. Please try again.');
    // });
  }

  downloadTemplateAsHTML(item: TemplateItem) {
    // Handle HTML download logic
    // const blob = new Blob([item.html], { type: 'text/html' });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = `${item.name.replace(/\s+/g, '-').toLowerCase()}.html`;
    // document.body.appendChild(a);
    // a.click();
    // document.body.removeChild(a);
    // URL.revokeObjectURL(url);
  }

  onSearchFocus() {
    this.searchFocused.set(true);
  }

  onSearchBlur() {
    this.searchFocused.set(false);
  }

  clearSearch() {
    this.globalSearch.set('');
    this.currentPage.set(1);
    // Scroll to top optimistically
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

