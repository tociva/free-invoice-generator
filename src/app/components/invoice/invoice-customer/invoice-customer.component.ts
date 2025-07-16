import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GetRowIdParams, GridApi, GridOptions, GridReadyEvent, ICellEditorParams, ICellRendererParams, NewValueParams, SuppressKeyboardEventParams } from 'ag-grid-community';
import { Observable, Subject, takeUntil } from 'rxjs';
import { displayAutoCompleteWithName } from '../../../../util/daybook.util';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { CountryService } from '../../../services/country.service';
import { AutoCompleteEditorComponent } from '../../common/ag-grid/editor/auto-complete-editor/auto-complete-editor.component';
import { TextAreaEditorComponent } from '../../common/ag-grid/editor/text-area-editor/text-area-editor.component';
import { LabelColumnRendererComponent } from '../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { patchCustomer, setCustomerCountry } from '../store/actions/invoice.action';
import { Country } from '../store/model/country.model';
import { selectInvoice } from '../store/selectors/invoice.selectors';

export enum CustomerFormItem {
  NAME = 'Customer Name',
  MOBILE = 'Mobile',
  EMAIL = 'Email',
  GSTIN = 'GSTIN',
  ADDRESS = 'Customer Address',
  COUNTRY = 'Country',
}
@Component({
  selector: 'app-invoice-customer',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule
  ],
  templateUrl: './invoice-customer.component.html',
  styleUrl: './invoice-customer.component.scss'
})
export class InvoiceCustomerComponent implements OnDestroy {

  @Input() simple = false;

  public customerGridApi!: GridApi<FormColumnDef>;

  private destroy$ = new Subject<void>();

  defaultColDef: ColDef<FormColumnDef> = {
    singleClickEdit: true,
    editable: false,
    resizable: true,
    sortable: false,
    
  };

  gridOptions: GridOptions<FormColumnDef> = {
    suppressMenuHide: true,
    rowSelection: 'single',
    animateRows: true,
    enableBrowserTooltips: true,
    getRowHeight: (params) => {
      switch (params.data?.label) {
        case CustomerFormItem.ADDRESS:
          return 170;
        default:
          return 50;
      }
    },
  };
  
  constructor(private store:Store, 
    private countryService:CountryService) {}

    
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private findCustomerEditorComponent = (params: ICellEditorParams<FormColumnDef>) => {
    
    switch (params.data.label) {

    case CustomerFormItem.COUNTRY:
      return this.findCountryEditorComponent(params.data.value);

    case CustomerFormItem.ADDRESS:
      return { component: TextAreaEditorComponent, params: { value: params.data.value, rows: 10 } };
    }

    return {
      component: null
    };

  };

  private handleCustomerCellValueChanged = (event: NewValueParams<FormColumnDef>) => {
    switch (event.data.label) {
      case CustomerFormItem.NAME:
        this.store.dispatch(patchCustomer({ customer: { name: event.newValue } }));
        break;
      case CustomerFormItem.ADDRESS:
        this.store.dispatch(patchCustomer({ customer: { address: event.newValue } }));
        break;
      case CustomerFormItem.EMAIL:
        this.store.dispatch(patchCustomer({ customer: { email: event.newValue } }));
        break;
      case CustomerFormItem.MOBILE:
        this.store.dispatch(patchCustomer({ customer: { phone: event.newValue } }));
        break;
      case CustomerFormItem.GSTIN:
        this.store.dispatch(patchCustomer({ customer: { gstin: event.newValue } }));
        break;
    }
  };

  customerColumnDefs: ColDef<FormColumnDef>[] = [
    { field: 'label', headerName: '', width: 150,flex:2 },
    {
      field: 'value',
      headerName: '',
      width: 200,
      flex:3,
      editable: true,
      cellEditorSelector: this.findCustomerEditorComponent,
      cellRendererSelector: InvoiceCustomerComponent.findCustomerCellRenderer,
      tooltipValueGetter: (params) => {
        const value = params.data?.value;

        if (typeof value === 'string') {
          return value;
        }

        if (value && typeof value === 'object' && 'name' in value && typeof value.name === 'string') {
          return value.name;
        }

        return '';
      },
      onCellValueChanged: this.handleCustomerCellValueChanged,
      suppressKeyboardEvent: (params: SuppressKeyboardEventParams<FormColumnDef>) => {
        switch (params.data?.label) {
          case CustomerFormItem.ADDRESS:
            return params.editing && params.event.key === 'Enter';
        }
        return false;
      },
    }
  ];

  customerRowData: FormColumnDef[] = [];


  handleCustomerCountryOptionSelected = (val: Country): void => {
    this.store.dispatch(setCustomerCountry({ country: val }));
  };
  
  fetchCountries = (val?: string | Country): Observable<Country[]> => {
    return this.countryService.fetchCountries(val).pipe(takeUntil(this.destroy$));
  };

  private findCountryEditorComponent = (_valueP: unknown) => ({
    component: AutoCompleteEditorComponent<Country>,
    params: {
      optionsFetcher: this.fetchCountries,
      displayWith: displayAutoCompleteWithName,
      onOptionSelected: this.handleCustomerCountryOptionSelected
    }
  });

  private static findCustomerCellRenderer = (params:ICellRendererParams<FormColumnDef>) => {

   
    switch (params.data?.label) {

    case CustomerFormItem.COUNTRY:
      { const dtF = params.data?.value as Country;
      return {component: LabelColumnRendererComponent,
        params: {labelValue: dtF.name, icon: 'arrow_drop_down_circle'}}; }

    case CustomerFormItem.ADDRESS:
      {
        let labelValueAddress = params.data?.value;
        if(!labelValueAddress) {
          labelValueAddress = 'Type customer address here';
        }
        return {component: LabelColumnRendererComponent,
          params: {labelValue: labelValueAddress, multiLine: true}};
      }
    case CustomerFormItem.NAME:
      {
        let labelValueName = params.data?.value;
        if(!labelValueName) {
          labelValueName = 'Type customer name here';
        }
        return {component: LabelColumnRendererComponent,
          params: {labelValue: labelValueName}};
      }

    }
    return params.data?.value ?? '';
  
  };

  onCustomerGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.customerGridApi = params.api;
    this.store.select(selectInvoice)
    .pipe(takeUntil(this.destroy$))
    .subscribe((invoice) => {
      const {customer} = invoice;
      const customerRowDataTemp:FormColumnDef[] = [
        { label: CustomerFormItem.NAME, value: customer.name },
        { label: CustomerFormItem.ADDRESS, value: customer.address },
      ];
      if(!this.simple) {
        customerRowDataTemp.push({ label: CustomerFormItem.COUNTRY, value: customer.country },
          { label: CustomerFormItem.EMAIL, value: customer.email },
          { label: CustomerFormItem.MOBILE, value: customer.phone },
          { label: CustomerFormItem.GSTIN, value: customer.gstin }
        );
      }
      this.customerRowData = customerRowDataTemp;
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getRowId = (params: GetRowIdParams<FormColumnDef>) => params.data.label;
}
