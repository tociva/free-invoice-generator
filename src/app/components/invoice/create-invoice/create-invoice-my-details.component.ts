import { ColDef, GridApi, GridReadyEvent, ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { map, Observable } from 'rxjs';
import { OPTIONS_COUNT } from '../../../../util/constants';
import { displayAutoCompleteWithName } from '../../../../util/daybook.util';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { AutoCompleteEditorComponent } from '../../common/ag-grid/editor/auto-complete-editor/auto-complete-editor.component';
import { LabelColumnRendererComponent } from '../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { Country } from '../store/model/country.model';
import { selectAllCountries } from '../store/selectors/country.selectors';
import { CreateInvoiceDetailsComponent } from './create-invoice-details.component';
import { CreateInvoiceCustomerComponent } from './create-invoice-customer.component';

export enum MyDetailsFormItem {
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
export class CreateInvoiceMyDetailsComponent extends CreateInvoiceCustomerComponent {

  public myDetailsGridApi!: GridApi<FormColumnDef>;

  private findMyDetailsEditorComponent = (params: ICellEditorParams<FormColumnDef>) => {
    
    switch (params.data.label) {

    case MyDetailsFormItem.COUNTRY:
      return this.findMyDetailsCountryEditorComponent(params.data.value);

    }

    return {
      component: null
    };

  };

  myDetailsColumnDefs: ColDef<FormColumnDef>[] = [
    { field: 'label', headerName: '', width: 150 },
    {
      field: 'value',
      headerName: '',
      width: 200,
      editable: true,
      cellEditorSelector: this.findMyDetailsEditorComponent,
      cellRendererSelector: CreateInvoiceMyDetailsComponent.findMyDetailsCellRenderer,
    }
  ];

  myDetailsRowData: FormColumnDef[] = [
    { label: MyDetailsFormItem.NAME, value: 'Tociva Technologies' },
    { label: MyDetailsFormItem.LINE1, value: '123 Main St' },
    { label: MyDetailsFormItem.LINE2, value: 'St.Louis, MO' },
    { label: MyDetailsFormItem.STREET, value: 'Carolina St' },
    { label: MyDetailsFormItem.CITY, value: 'St.Louis,' },
    { label: MyDetailsFormItem.ZIP, value: '63101' },
    { label: MyDetailsFormItem.STATE, value: 'Missouri' },
    { label: MyDetailsFormItem.COUNTRY, value: { name: 'India' } },
    { label: MyDetailsFormItem.EMAIL, value: 'info@tociva.com' },
    { label: MyDetailsFormItem.MOBILE, value: '1234567890' }
  ];

  handleMyDetailsCountryOptionSelected = (val: Country): void => {
      const rowNode = this.myDetailsGridApi.getRowNode(MyDetailsFormItem.COUNTRY);
      if (rowNode) {
        rowNode.data = { label: MyDetailsFormItem.COUNTRY, value: val };
      }
    };

  private findMyDetailsCountryEditorComponent = (_valueP: unknown) => ({
    component: AutoCompleteEditorComponent<Country>,
    params: {
      optionsFetcher: this.fetchCountries,
      displayWith: displayAutoCompleteWithName,
      onOptionSelected: this.handleMyDetailsCountryOptionSelected
    }
  });

  private static findMyDetailsCellRenderer = (params:ICellRendererParams<FormColumnDef>) => {

    if (!params.data?.value) {

      return '';

    }

    switch (params.data.label) {

    case MyDetailsFormItem.COUNTRY:
      const dtF = params.data.value as Country;
      return {component: LabelColumnRendererComponent,
        params: {labelValue: dtF.name}};

    }
    return params.data.value;
  
  };

  onMyDetailsGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.myDetailsGridApi = params.api;
  }
}