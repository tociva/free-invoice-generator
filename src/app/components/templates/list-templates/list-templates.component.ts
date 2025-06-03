import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadTemplates } from '../store/actions/template.actions';
import { TemplateItem } from '../store/model/template.model';
import { selectPaginatedTemplateItems } from '../store/selectors/template.selector';
import { TemplateState } from '../store/state/template.state';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';



@Component({
  selector: 'app-list-templates',
  templateUrl: './list-templates.component.html',
  styleUrls: ['./list-templates.component.scss'],
  standalone: true,
  imports: [
  CommonModule, FormsModule, MatPaginatorModule,
  MatCheckboxModule, MatFormFieldModule, MatInputModule,
  MatButtonModule, MatCardModule
]
})
export class ListTemplatesComponent {
  private store = inject<Store<TemplateState>>(Store);
  templates: TemplateItem[] = [];
  filteredTemplates: TemplateItem[] = [];
  paginatedTemplates: TemplateItem[] = [];
  private safeHtmlMap: Record<string, SafeHtml> = {};

  filterText = '';
  filterSubject = new Subject<string>();
  selectedTaxTypes: string[] = [];
  taxOptions = ['IGST', 'CGST & SGST', 'Non-Taxable'];
  colorOptions = ['Red', 'Blue', 'Green', 'Yellow'];
  selectedColors: string[] = [];

   @ViewChild(MatPaginator) paginator!: MatPaginator;
  itemsPerPage = 5;
  totalItems = 0;

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.store.dispatch(loadTemplates());
    this.store.select(selectPaginatedTemplateItems).subscribe((templates) => {
      this.templates = templates;
      this.templates.forEach((item) => this.fetchAndSanitizeHtml(item.path));
      this.applyFilter();
    });

    this.filterSubject.pipe(debounceTime(300)).subscribe((text) => {
      this.filterText = text;
      this.applyFilter();
    });
  }

   ngAfterViewInit() {
    if (this.paginator) {
      this.paginator.page.subscribe((event: PageEvent) => {
        this.itemsPerPage = event.pageSize;
        this.updatePaginatedTemplates(event.pageIndex);
      });
    }
  }
  
  private fetchAndSanitizeHtml(path: string): void {
    this.http.get(path, { responseType: 'text' }).subscribe({
      next: (html: string) => {
        this.safeHtmlMap[path] = this.sanitizer.bypassSecurityTrustHtml(html);
      },
      error: (error) => console.error(`Failed to load HTML from ${path}`, error)
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

  onFilterInput(text: string) {
    this.filterSubject.next(text);
  }

  toggleTaxType(type: string) {
    const index = this.selectedTaxTypes.indexOf(type);
    if (index > -1) this.selectedTaxTypes.splice(index, 1);
    else this.selectedTaxTypes.push(type);
    this.applyFilter();
  }

  toggleColor(color: string) {
    const index = this.selectedColors.indexOf(color);
    if (index > -1) this.selectedColors.splice(index, 1);
    else this.selectedColors.push(color);
    this.applyFilter();
  }
  applyFilter() {
    const lowerFilter = this.filterText.toLowerCase().trim();
    this.filteredTemplates = this.templates.filter(item => {
      const matchesText = item.name.toLowerCase().includes(lowerFilter);
      const matchesTax = this.selectedTaxTypes.length === 0 || this.selectedTaxTypes.includes(item.taxType || '');
      const matchesColor = this.selectedColors.length === 0 || this.selectedColors.includes(item.color || '');
      return matchesText && matchesTax && matchesColor;
    });

    this.totalItems = this.filteredTemplates.length;
    this.updatePaginatedTemplates(0);
    if (this.paginator) this.paginator.firstPage();
  }

  updatePaginatedTemplates(pageIndex: number) {
    const start = pageIndex * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedTemplates = this.filteredTemplates.slice(start, end);
  }

   clearFilters() {
  this.filterText = '';
  this.selectedTaxTypes = [];
  this.selectedColors = [];
  this.applyFilter();
  if (this.paginator) {
    this.paginator.firstPage();
  }
}
}
