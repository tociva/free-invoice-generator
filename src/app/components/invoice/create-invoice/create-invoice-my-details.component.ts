import { ColDef, GridApi, GridReadyEvent, ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { displayAutoCompleteWithName } from '../../../../util/daybook.util';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { AutoCompleteEditorComponent } from '../../common/ag-grid/editor/auto-complete-editor/auto-complete-editor.component';
import { LabelColumnRendererComponent } from '../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { setOrganizationCountry } from '../store/actions/organization.action';
import { Country } from '../store/model/country.model';
import { selectSelectedOrganization } from '../store/selectors/organization.selectors';
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
  
  myDetailsRowData: FormColumnDef[] = [];

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


  handleMyDetailsCountryOptionSelected = (val: Country): void => {
    this.store.dispatch(setOrganizationCountry({ country: val }));
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
    this.store.select(selectSelectedOrganization).subscribe((organization) => {
      this.myDetailsRowData = [
        { label: MyDetailsFormItem.NAME, value: organization.name },
        { label: MyDetailsFormItem.LINE1, value: organization.line1 },
        { label: MyDetailsFormItem.LINE2, value: organization.line2 },
        { label: MyDetailsFormItem.STREET, value: organization.street },
        { label: MyDetailsFormItem.CITY, value: organization.city },
        { label: MyDetailsFormItem.ZIP, value: organization.zip },
        { label: MyDetailsFormItem.STATE, value: organization.state },
        { label: MyDetailsFormItem.COUNTRY, value: organization.country },
        { label: MyDetailsFormItem.EMAIL, value: organization.email },
        { label: MyDetailsFormItem.MOBILE, value: organization.mobile },
        { label: MyDetailsFormItem.GSTIN, value: organization.gstin },
      ];
    });
  }
}