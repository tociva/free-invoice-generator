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

  private safeHtmlMap: Record<string, SafeHtml> = {};


  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}
  
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

  ngOnInit() {
    this.store.dispatch(loadTemplates());
    this.store.select(selectPaginatedTemplateItems).subscribe((templates) => {
      this.templates = templates;
      this.templates.forEach((item) => {
        this.fetchAndSanitizeHtml(item.path);
      });
    });
  }

  findSafeHtml(path: string) {
    const rawHtml =  this.safeHtmlMap[path] || null;
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
      const finalHtml = wrapperStyle + rawHtml;
      return this.sanitizer.bypassSecurityTrustHtml(finalHtml);
    
  }
}
