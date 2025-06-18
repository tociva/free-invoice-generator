import { ColDef, GridApi, GridReadyEvent, ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { map, Observable } from 'rxjs';
import { OPTIONS_COUNT } from '../../../../../util/constants';
import { displayAutoCompleteWithName } from '../../../../../util/daybook.util';
import { FormColumnDef } from '../../../../../util/form-column-def.type';
import { AutoCompleteEditorComponent } from '../../../common/ag-grid/editor/auto-complete-editor/auto-complete-editor.component';
import { LabelColumnRendererComponent } from '../../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { setCustomerCountry } from '../../store/actions/invoice.action';
import { Country } from '../../store/model/country.model';
import { selectAllCountries } from '../../store/selectors/country.selectors';
import { selectInvoice } from '../../store/selectors/invoice.selectors';
import { CreateInvoiceDetailsComponent } from '../create-invoice-details.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  selector: 'app-create-invoice-customer',
  standalone: true, // ✅ REQUIRED
  imports: [
    CommonModule,
  ],
  templateUrl: './create-invoice-customer.component.html',
  styleUrls: ['./create-invoice-customer.component.scss']
})
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

  customerRowData: FormColumnDef[] = [];

  fetchCountries = (val?: string | Country): Observable<Country[]> => {
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

  handleCustomerCountryOptionSelected = (val: Country): void => {
    this.store.dispatch(setCustomerCountry({ country: val }));
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
    this.store.select(selectInvoice).subscribe((invoice) => {
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
}