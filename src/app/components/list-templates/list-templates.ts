import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal, output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

type TemplateItem = {
  id: string;
  name: string;
  description: string;
  html: string;
  safeHTML?: SafeHtml;
};

@Component({
  selector: 'app-list-templates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-templates.html',
  styleUrls: ['./list-templates.css'],
})
export class ListTemplates {
  // initial templates (html simplified for examples)
  private initialTemplates: TemplateItem[] = [
    {
      id: 'template-1',
      name: 'Classic',
      description: 'Clean rows and simple header',
      html: '<div style="font-family:Arial;padding:10px"><h3>Classic</h3><p>Sample invoice</p></div>',
    },
    {
      id: 'template-2',
      name: 'Modern',
      description: 'Minimal with accent color',
      html: '<div style="font-family:Helvetica;padding:10px;color:#2b6cb0"><h3>Modern</h3><p>Sample invoice</p></div>',
    },
    {
      id: 'template-3',
      name: 'Compact',
      description: 'Tight layout for small screens',
      html: '<div style="font-family:Verdana;padding:6px"><h3>Compact</h3><p>Sample invoice</p></div>',
    },
  ];

  templates = signal<TemplateItem[]>([]);
  
  // global search box (top center)
  globalSearch = signal('');

  // pagination
  itemsPerPage = signal(6);
  currentPage = signal(1);

  // preview
  previewTemplateId = signal<string | null>(null);

  // outputs
  selectedChange = output<string | null>();

  // filtered by global search
  filteredTemplates = computed(() => {
    const q = this.globalSearch().toLowerCase();
    if (!q) return this.templates();
    return this.templates().filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
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

  previewItem = computed(() => this.templates().find(t => t.id === this.previewTemplateId()));

  constructor(private _sanitizer: DomSanitizer) {
    // sanitize templates and set signal
    const t = this.initialTemplates.map(it => ({ ...it, safeHTML: this._sanitizer.bypassSecurityTrustHtml(it.html) }));
    this.templates.set(t);

    effect(() => {
      // reset page if current page is out of range
      const pages = Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage()));
      if (this.currentPage() > pages) this.currentPage.set(pages);
    });
  }


  selectTemplate(id: string) {
    this.previewTemplateId.set(id);
    this.selectedChange.emit(id);
  }

  previewTemplate(item: TemplateItem) {
    this.previewTemplateId.set(item.id);
  }


  nextPage() {
    this.currentPage.update(p => p + 1);
  }

  prevPage() {
    this.currentPage.update(p => Math.max(1, p - 1));
  }
}

