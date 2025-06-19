import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GetRowIdParams, GridApi, GridOptions, GridReadyEvent, ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { displayAutoCompleteWithName } from '../../../../util/daybook.util';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { CountryService } from '../../../services/country.service';
import { AutoCompleteEditorComponent } from '../../common/ag-grid/editor/auto-complete-editor/auto-complete-editor.component';
import { LabelColumnRendererComponent } from '../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { setOrganizationCountry } from '../store/actions/invoice.action';
import { Country } from '../store/model/country.model';
import { selectInvoice } from '../store/selectors/invoice.selectors';
import { Observable } from 'rxjs';

export enum OrganizatonFormItem {
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
  selector: 'app-invoice-organization',
  imports: [
    CommonModule,
    AgGridModule],
  templateUrl: './invoice-organization.component.html',
  styleUrl: './invoice-organization.component.scss'
})
export class InvoiceOrganizationComponent {


  public myDetailsGridApi!: GridApi<FormColumnDef>;
  
  myDetailsRowData: FormColumnDef[] = [];

  defaultColDef: ColDef<FormColumnDef> = {
    editable: false,
    resizable: true,
    sortable: false,
    
  };

  gridOptions: GridOptions<FormColumnDef> = {
    suppressMenuHide: true,
    rowSelection: 'single',
    animateRows: true
  };

  constructor(
    private store: Store,
    private countryService:CountryService
  ) {
  }

  // eslint-disable-next-line class-methods-use-this
  getRowId = (params: GetRowIdParams<FormColumnDef>) => params.data.label;

  fetchCountries = (val?: string | Country): Observable<Country[]> => {
    return this.countryService.fetchCountries(val);
  };
  

  private findMyDetailsEditorComponent = (params: ICellEditorParams<FormColumnDef>) => {
    
    switch (params.data.label) {

    case OrganizatonFormItem.COUNTRY:
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
      cellRendererSelector: InvoiceOrganizationComponent.findMyDetailsCellRenderer,
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

    case OrganizatonFormItem.COUNTRY:
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
        { label: OrganizatonFormItem.NAME, value: organization.name },
        { label: OrganizatonFormItem.LINE1, value: organization.addressLine1 },
        { label: OrganizatonFormItem.LINE2, value: organization.addressLine2 },
        { label: OrganizatonFormItem.STREET, value: organization.street },
        { label: OrganizatonFormItem.CITY, value: organization.city },
        { label: OrganizatonFormItem.ZIP, value: organization.zipCode },
        { label: OrganizatonFormItem.STATE, value: organization.state },
        { label: OrganizatonFormItem.COUNTRY, value: organization.country },
        { label: OrganizatonFormItem.EMAIL, value: organization.email },
        { label: OrganizatonFormItem.MOBILE, value: organization.phone },
        { label: OrganizatonFormItem.GSTIN, value: organization.gstin },
      ];
    });
  }
}
