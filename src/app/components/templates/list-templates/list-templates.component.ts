import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { firstValueFrom, Observable } from 'rxjs';
import { loadTemplates, setPagination, addSearchTag, removeSearchTag} from '../store/actions/template.actions';
import { TemplateItem } from '../store/model/template.model';
import { selectPageSize, selectPaginatedTemplateItems, selectSearchTags, selectTotalCount } from '../store/selectors/template.selector';
import { TemplateState } from '../store/state/template.state';
import { sampleInvoice } from './list-templates.util';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { selectTags } from '../store/selectors/tag.selectors';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';


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


 

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {
    
   }

  private createSafeHtml = (html: string): SafeHtml => {
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
    const finalHtml = wrapperStyle + html;
    return this.sanitizer.bypassSecurityTrustHtml(finalHtml);
  };

  static fillTemplate(html: string): string {
    const itemRowTemplate = `
      <tr>
        <td>[[item_name]]</td>
        <td>[[item_quantity]]</td>
        <td>[[item_price]]</td>
        <td>[[item_cgst]]</td>
        <td>[[item_sgst]]</td>
        <td>[[item_amount]]</td>
      </tr>`;

    const filledItems = sampleInvoice.items.map((item) =>
      itemRowTemplate
        .replace('[[item_name]]', item.name)
        .replace('[[item_quantity]]', item.quantity.toString())
        .replace('[[item_price]]', item.price.toFixed(2))
        .replace('[[item_cgst]]', item.tax1Amount.toFixed(2))
        .replace('[[item_sgst]]', item.tax2Amount.toFixed(2))
        .replace('[[item_amount]]', item.grandTotal.toFixed(2))
    ).join('');

    // Replace the entire block from [[items_start]] to [[items_end]]
    const itemsRegex = /\[\[items_start\]\][\s\S]*?\[\[items_end\]\]/;
    const htmlWithItems = html.replace(itemsRegex, filledItems);

    const htmlS = htmlWithItems
      .replace('[[invoice_number]]', sampleInvoice.number)
      .replace('[[invoice_date]]', sampleInvoice.date.toLocaleDateString())
      .replace('[[payment_due_date]]', sampleInvoice.dueDate.toLocaleDateString())
      .replace('[[customer_name]]', sampleInvoice.customer.name)
      .replace('[[customer_address]]', sampleInvoice.customer.addressLine1)
      .replace('[[customer_phone]]', sampleInvoice.customer.phone)
      .replace('[[customer_email]]', sampleInvoice.customer.email)
      .replace('[[org_name]]', sampleInvoice.organization.name)
      .replace('[[org_address]]', sampleInvoice.organization.addressLine1)
      .replace('[[org_phone]]', sampleInvoice.organization.phone)
      .replace('[[org_email]]', sampleInvoice.organization.email)
      .replace('[[subtotal]]', sampleInvoice.subTotal.toFixed(2))
      .replace('[[tax_amount]]', sampleInvoice.taxTotal.toFixed(2))
      .replace('[[grand_total]]', sampleInvoice.grandTotal.toFixed(2))
      .replace('[[mail_logo_src]]', sampleInvoice.organization.name || '');
    return htmlS;

  }

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
          const html = ListTemplatesComponent.fillTemplate(template);
          const safeHTML = this.createSafeHtml(html);
  
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
  
  
    // TAGS
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

  // eslint-disable-next-line class-methods-use-this
 downloadTemplateAsPDF(item: TemplateItem): void {
  const container = document.createElement('div');
  container.innerHTML = item.html;
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '800px';
  container.style.padding = '20px';
  container.style.background = 'white';
  container.style.zIndex = '-1';
  document.body.appendChild(container);

  html2canvas(container, {
    scale: 2,
    useCORS: true
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 1) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${item.name}.pdf`);
    document.body.removeChild(container);
  })['catch']((err) => {
    console.error('Error generating PDF:', err);
    document.body.removeChild(container);
  });
}

  // eslint-disable-next-line class-methods-use-this
  downloadTemplateAsHTML(item: TemplateItem): void {
    const blob = new Blob([item.template], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.name}.template.html`;
    a.click();

    URL.revokeObjectURL(url);
  }

  // eslint-disable-next-line class-methods-use-this
  previewTemplate(item: TemplateItem): void {
    const blob = new Blob([item.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
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
