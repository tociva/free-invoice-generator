import { ColDef, GetRowIdParams, GridApi, GridOptions, GridReadyEvent, ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { displayAutoCompleteWithName } from '../../../../util/daybook.util';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { AutoCompleteEditorComponent } from '../../common/ag-grid/editor/auto-complete-editor/auto-complete-editor.component';
import { LabelColumnRendererComponent } from '../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { setOrganizationCountry } from '../store/actions/invoice.action';
import { Country } from '../store/model/country.model';
import { selectInvoice } from '../store/selectors/invoice.selectors';
import { CreateInvoiceCustomerComponent } from '../create-invoice/create-customer-details/create-invoice-customer.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';

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
@Component({
  selector: 'app-create-invoice-organization',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule
],
  templateUrl: './create-invoice-organization.component.html',
  styleUrls: ['./create-invoice-organization.component.scss']
})
export class CreateInvoiceOrganizationComponent extends CreateInvoiceCustomerComponent {

  public myDetailsGridApi!: GridApi<FormColumnDef>;
  
  myDetailsRowData: FormColumnDef[] = [];

  override defaultColDef: ColDef<FormColumnDef> = {
    editable: false,
    resizable: true,
    sortable: false,
    
  };

  override gridOptions: GridOptions<FormColumnDef> = {
    suppressMenuHide: true,
    rowSelection: 'single',
    animateRows: true
  };

  // eslint-disable-next-line class-methods-use-this
  override getRowId = (params: GetRowIdParams<FormColumnDef>) => params.data.label;


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
    { field: 'label', headerName: '', width: 150, flex: 1 },
    {
      field: 'value',
      headerName: '',
      width: 200,
      flex: 1,
      editable: true,
      cellEditorSelector: this.findMyDetailsEditorComponent,
      cellRendererSelector: CreateInvoiceOrganizationComponent.findMyDetailsCellRenderer,
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
      { const dtF = params.data.value as Country;
      return {component: LabelColumnRendererComponent,
        params: {labelValue: dtF.name}}; }

    }
    return params.data.value;
  
  };

  onMyDetailsGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.myDetailsGridApi = params.api;
    this.store.select(selectInvoice).subscribe((invoice) => {
      const {organization} = invoice;
      this.myDetailsRowData = [
        { label: MyDetailsFormItem.NAME, value: organization.name },
        { label: MyDetailsFormItem.LINE1, value: organization.addressLine1 },
        { label: MyDetailsFormItem.LINE2, value: organization.addressLine2 },
        { label: MyDetailsFormItem.STREET, value: organization.street },
        { label: MyDetailsFormItem.CITY, value: organization.city },
        { label: MyDetailsFormItem.ZIP, value: organization.zipCode },
        { label: MyDetailsFormItem.STATE, value: organization.state },
        { label: MyDetailsFormItem.COUNTRY, value: organization.country },
        { label: MyDetailsFormItem.EMAIL, value: organization.email },
        { label: MyDetailsFormItem.MOBILE, value: organization.phone },
        { label: MyDetailsFormItem.GSTIN, value: organization.gstin },
      ];
    });
  }
}