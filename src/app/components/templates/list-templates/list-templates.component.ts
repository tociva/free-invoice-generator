import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { firstValueFrom, Observable } from 'rxjs';
import { TemplateService } from '../../../services/template.service';
import { InvoicePreviewDialogComponent } from '../../invoice-preview-dialog/invoice-preview-dialog.component';
import { TemplateUtil } from '../../util/template.util';
import { addSearchTag, loadTemplates, removeSearchTag, setPagination } from '../store/actions/template.actions';
import { TemplateItem } from '../store/model/template.model';
import { selectTags } from '../store/selectors/tag.selectors';
import { selectPageSize, selectPaginatedTemplateItems, selectSearchTags, selectTotalCount } from '../store/selectors/template.selector';
import { TemplateState } from '../store/state/template.state';

@Component({
  selector: 'app-list-templates',
  templateUrl: './list-templates.component.html',
  styleUrls: ['./list-templates.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatPaginatorModule,
      MatInputModule,
    MatButtonModule, MatCardModule, MatIconModule, MatChipsModule, MatAutocompleteModule
  ]
})
export class ListTemplatesComponent implements OnInit, AfterViewInit {

  readonly separatorKeysCodes = [ENTER, COMMA];
  private store = inject<Store<TemplateState>>(Store);
  private safeHtmlMap: Record<string, SafeHtml> = {};
  tags$!: Observable<string[]>;
  selectedTags$ = this.store.select(selectSearchTags);
  templates: TemplateItem[] = [];
  downloadTemplateAsPDF = TemplateUtil.downloadTemplateAsPDF;
  downloadTemplateAsHTML = TemplateUtil.downloadTemplateAsHTML;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private templateService: TemplateService,
    private http: HttpClient,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.store.dispatch(loadTemplates());
  
    this.store.select(selectPageSize).subscribe((pageSize) => {
      this.itemsPerPage = pageSize;
    });
  
    this.store.select(selectTotalCount).subscribe((totalCount) => {
      this.totalItems = totalCount;
    });
  
    this.store.select(selectPaginatedTemplateItems).subscribe(async (templateItems) => {
      this.templates = templateItems;
  
      this.safeHtmlMap = {}; // clear existing
  
      // process all items in parallel
      const tmpls: TemplateItem[] = await Promise.all(
        templateItems.map(async (item) => {
          const template = await firstValueFrom(
            this.http.get(item.path, { responseType: 'text' })
          );
          const html = TemplateUtil.fillTemplate(template);
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
  
    this.tags$ = this.store.select(selectTags);
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
    this.dialog.open(InvoicePreviewDialogComponent, {
      data: { html: item.html },
      width: '820px',
      height: '1150px',
      maxWidth: '100vw',
      panelClass: 'a4-dialog'
    });
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
