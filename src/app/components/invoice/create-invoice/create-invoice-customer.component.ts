import { GridApi, ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
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
export class CreateInvoiceCustomerComponent {

  public customerGridApi!: GridApi<FormColumnDef>;
  public store = inject<Store<CountryState>>(Store);

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

  private handleOptionSelected = (val: Country): void => {
    const rowNode = this.customerGridApi.getRowNode(CustomerFormItem.COUNTRY);
    if (rowNode) {
      rowNode.data = { label: CustomerFormItem.COUNTRY, value: val };
    }
  };
  


  private findCountryEditorComponent = (_valueP: unknown) => ({
    component: AutoCompleteEditorComponent<Country>,
    params: {
      optionsFetcher: this.fetchCountries,
      displayWith: displayAutoCompleteWithName,
      onOptionSelected: this.handleOptionSelected
    }
  });

  public static findCellRenderer = (params:ICellRendererParams<FormColumnDef>) => {

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

  public findCustomerEditorComponent = (params: ICellEditorParams<FormColumnDef>) => {
    
      switch (params.data.label) {
  
      case CustomerFormItem.COUNTRY:
        return this.findCountryEditorComponent(params.data.value);
  
      }
  
      return {
        component: null
      };
  
  };
}