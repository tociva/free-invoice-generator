import { ColDef, GridApi, GridReadyEvent, ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { AutoCompleteEditorComponent } from '../../common/ag-grid/editor/auto-complete-editor/auto-complete-editor.component';
import { Country } from '../store/model/country.model';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { CountryState } from '../store/state/country.state';
import { inject } from '@angular/core';
import { selectAllCountries } from '../store/selectors/country.selectors';
import { map } from 'rxjs';
import { OPTIONS_COUNT } from '../../../../util/constants';
import { displayAutoCompleteWithName } from '../../../../util/daybook.util';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { LabelColumnRendererComponent } from '../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { CreateInvoiceDetailsComponent } from './create-invoice-details.component';

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
export class CreateInvoiceCustomerComponent extends CreateInvoiceDetailsComponent {

  public customerGridApi!: GridApi<FormColumnDef>;

  private findCustomerEditorComponent = (params: ICellEditorParams<FormColumnDef>) => {
    
    switch (params.data.label) {

    case CustomerFormItem.COUNTRY:
      return this.findCountryEditorComponent(params.data.value);

    }

    return {
      component: null
    };

  };

  customerColumnDefs: ColDef<FormColumnDef>[] = [
    { field: 'label', headerName: '', width: 150 },
    {
      field: 'value',
      headerName: '',
      width: 200,
      editable: true,
      cellEditorSelector: this.findCustomerEditorComponent,
      cellRendererSelector: CreateInvoiceCustomerComponent.findCustomerCellRenderer,
    }
  ];

  customerRowData: FormColumnDef[] = [
    { label: CustomerFormItem.NAME, value: 'Tociva Technologies' },
    { label: CustomerFormItem.LINE1, value: '123 Main St' },
    { label: CustomerFormItem.LINE2, value: 'St.Louis, MO' },
    { label: CustomerFormItem.STREET, value: 'Carolina St' },
    { label: CustomerFormItem.CITY, value: 'St.Louis,' },
    { label: CustomerFormItem.ZIP, value: '63101' },
    { label: CustomerFormItem.STATE, value: 'Missouri' },
    { label: CustomerFormItem.COUNTRY, value: { name: 'India' } },
    { label: CustomerFormItem.EMAIL, value: 'info@tociva.com' },
    { label: CustomerFormItem.MOBILE, value: '1234567890' }
  ];

  private fetchCountries = (val?: string | Country): Observable<Country[]> => {
    return this.store.select(selectAllCountries).pipe(
      map((countries) => {

        // If val is of type Country, return empty array
        if (val && typeof val === 'object') {
          return [];
        }

        if (!val?.trim()) {
          return countries.slice(0, OPTIONS_COUNT);
        }
  
        const filterVal = val.toLowerCase();
        return countries
          .filter((country) => country.name.toLowerCase().startsWith(filterVal))
          .slice(0, OPTIONS_COUNT);
      })
    );
  };

  private handleCountryOptionSelected = (val: Country): void => {
    const rowNode = this.customerGridApi.getRowNode(CustomerFormItem.COUNTRY);
    if (rowNode) {
      rowNode.data = { label: CustomerFormItem.COUNTRY, value: val };
    }
    this.changeCurrency(val.currency);
  };


  private findCountryEditorComponent = (_valueP: unknown) => ({
    component: AutoCompleteEditorComponent<Country>,
    params: {
      optionsFetcher: this.fetchCountries,
      displayWith: displayAutoCompleteWithName,
      onOptionSelected: this.handleCountryOptionSelected
    }
  });

  private static findCustomerCellRenderer = (params:ICellRendererParams<FormColumnDef>) => {

    if (!params.data?.value) {

      return '';

    }

    switch (params.data.label) {

    case CustomerFormItem.COUNTRY:
      const dtF = params.data.value as Country;
      return {component: LabelColumnRendererComponent,
        params: {labelValue: dtF.name}};

    }
    return params.data.value;
  
  };

  onCustomerGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.customerGridApi = params.api;
  }
}