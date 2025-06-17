import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from 'ag-grid-angular';
import { GetRowIdParams, GridOptions } from 'ag-grid-community';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { loadCountries } from '../store/actions/country.actions';
import { loadCurrencies } from '../store/actions/currency.actions';
import { loadDateFormats } from '../store/actions/date-format.actions';
import { CreateInvoiceOrganizationComponent } from './create-invoice-organization.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { selectPaginatedTemplateItemsAllConditions, selectSelectedTemplate } from '../../templates/store/selectors/template.selector';
import { loadTemplates, setSelectedTemplate } from '../../templates/store/actions/template.actions';
import { take } from 'rxjs';
import { TemplateItem } from '../../templates/store/model/template.model';

@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [
    AgGridModule,
    DragDropModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './create-invoice.component.html',
  styleUrl: './create-invoice.component.scss'
})
export class CreateInvoiceComponent extends CreateInvoiceOrganizationComponent implements OnInit {

  gridOptions: GridOptions = {
    domLayout: 'autoHeight',
    rowHeight: 30,
    singleClickEdit: true,
    enableBrowserTooltips: true,
    stopEditingWhenCellsLoseFocus: false,
  };

  defaultColDef = {
    sortable: false,
    resizable: false,
    suppressMenu: true,
    editable: false
  };

  ngOnInit(): void {
    this.store.dispatch(loadTemplates());
    this.store.dispatch(loadCountries());
    this.store.dispatch(loadCurrencies());
    this.store.dispatch(loadDateFormats());
    this.store.select(selectSelectedTemplate).pipe(take(1)).subscribe((selected) => {
    if (!selected) {
      this.store.select(selectPaginatedTemplateItemsAllConditions).pipe(take(1)).subscribe((templates: TemplateItem[]) => {
        if (templates.length > 0) {
          this.store.dispatch(setSelectedTemplate({ selectedTemplate: templates[0] }));
        }
      });
    }
  });
  }

  // eslint-disable-next-line class-methods-use-this
  getRowId = (params: GetRowIdParams<FormColumnDef>) => {
    const data = params?.data;
    return data?.label ?? '';
  };
}

