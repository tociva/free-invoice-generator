import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadTemplates } from '../store/actions/template.actions';
import { TemplateItem } from '../store/model/template.model';
import { selectPaginatedTemplateItems } from '../store/selectors/template.selector';
import { TemplateState } from '../store/state/template.state';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TemplatesComponent {
  private store = inject<Store<TemplateState>>(Store);
  templates: TemplateItem[] = [];
  paginatedTemplates: TemplateItem[] = [];

  private safeHtmlMap: Record<string, SafeHtml> = {};

  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.store.dispatch(loadTemplates());
    this.store.select(selectPaginatedTemplateItems).subscribe((templates) => {
      this.templates = templates;
      this.totalPages = Math.ceil(this.templates.length / this.itemsPerPage);
      this.updatePaginatedTemplates();
      this.templates.forEach((item) => {
        this.fetchAndSanitizeHtml(item.path);
      });
    });
  }

  private fetchAndSanitizeHtml(path: string): void {
    this.http.get(path, { responseType: 'text' }).subscribe({
      next: (html: string) => {
        this.safeHtmlMap[path] = this.sanitizer.bypassSecurityTrustHtml(html);
      },
      error: (error) => {
        console.error(`Failed to load HTML from ${path}`, error);
      }
    });
  }

  findSafeHtml(path: string) {
    const rawHtml = this.safeHtmlMap[path] || '';
    const wrapperStyle = `
      <style>
        html, body {
          margin: 0;
          padding: 0;
          transform: scale(0.5);
          transform-origin: top left;
          width: 200%;
          height: 200%;
          overflow: hidden;
        }
      </style>
    `;
    return this.sanitizer.bypassSecurityTrustHtml(wrapperStyle + rawHtml);
  }

  updatePaginatedTemplates() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedTemplates = this.templates.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedTemplates();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedTemplates();
    }
  }
}
