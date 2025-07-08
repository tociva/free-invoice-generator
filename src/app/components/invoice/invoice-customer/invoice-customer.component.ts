import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GetRowIdParams, GridApi, GridOptions, GridReadyEvent, ICellEditorParams, ICellRendererParams, NewValueParams } from 'ag-grid-community';
import { Observable, Subject, takeUntil } from 'rxjs';
import { displayAutoCompleteWithName } from '../../../../util/daybook.util';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { AutoCompleteEditorComponent } from '../../common/ag-grid/editor/auto-complete-editor/auto-complete-editor.component';
import { LabelColumnRendererComponent } from '../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { patchCustomer, setCustomerCountry } from '../store/actions/invoice.action';
import { Country } from '../store/model/country.model';
import { selectInvoice } from '../store/selectors/invoice.selectors';
import { CountryService } from '../../../services/country.service';

export enum CustomerFormItem {
  NAME = 'Name',
  MOBILE = 'Mobile',
  EMAIL = 'Email',
  GSTIN = 'GSTIN',
  LINE1 = 'Line1',
  LINE2 = 'Line2',
  STREET = 'Street',
  CITY = 'City',
  STATE = 'State',
  ZIP = 'Zip',
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
      case CustomerFormItem.LINE1:
        this.store.dispatch(patchCustomer({ customer: { addressLine1: event.newValue } }));
        break;
      case CustomerFormItem.LINE2:
        this.store.dispatch(patchCustomer({ customer: { addressLine2: event.newValue } }));
        break;
      case CustomerFormItem.STREET:
        this.store.dispatch(patchCustomer({ customer: { street: event.newValue } }));
        break;
      case CustomerFormItem.CITY:
        this.store.dispatch(patchCustomer({ customer: { city: event.newValue } }));
        break;
      case CustomerFormItem.ZIP:
        this.store.dispatch(patchCustomer({ customer: { zipCode: event.newValue } }));
        break;
      case CustomerFormItem.STATE:
        this.store.dispatch(patchCustomer({ customer: { state: event.newValue } }));
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
    { field: 'label', headerName: '', width: 150,flex:1 },
    {
      field: 'value',
      headerName: '',
      width: 200,
      flex:2,
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

    if (!params.data?.value) {

      return '';

    }

    switch (params.data.label) {

    case CustomerFormItem.COUNTRY:
      { const dtF = params.data.value as Country;
      return {component: LabelColumnRendererComponent,
        params: {labelValue: dtF.name}}; }

    }
    return params.data.value;
  
  };

  onCustomerGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.customerGridApi = params.api;
    this.store.select(selectInvoice)
    .pipe(takeUntil(this.destroy$))
    .subscribe((invoice) => {
      const {customer} = invoice;
      this.customerRowData = [
        { label: CustomerFormItem.NAME, value: customer.name },
        { label: CustomerFormItem.LINE1, value: customer.addressLine1 },
        { label: CustomerFormItem.LINE2, value: customer.addressLine2 },
        { label: CustomerFormItem.STREET, value: customer.street },
        { label: CustomerFormItem.CITY, value: customer.city },
        { label: CustomerFormItem.ZIP, value: customer.zipCode },
        { label: CustomerFormItem.STATE, value: customer.state },
        { label: CustomerFormItem.COUNTRY, value: customer.country },
        { label: CustomerFormItem.EMAIL, value: customer.email },
        { label: CustomerFormItem.MOBILE, value: customer.phone },
        { label: CustomerFormItem.GSTIN, value: customer.gstin }
      ];
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getRowId = (params: GetRowIdParams<FormColumnDef>) => params.data.label;
}
