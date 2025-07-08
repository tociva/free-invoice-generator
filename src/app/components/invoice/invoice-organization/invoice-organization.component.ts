import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AgGridModule } from 'ag-grid-angular';
import {
  ColDef,
  GetRowIdParams,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellEditorParams,
  ICellRendererParams,
  NewValueParams
} from 'ag-grid-community';
import { Observable, Subject, takeUntil } from 'rxjs';
import { displayAutoCompleteWithName } from '../../../../util/daybook.util';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { CountryService } from '../../../services/country.service';
import { AutoCompleteEditorComponent } from '../../common/ag-grid/editor/auto-complete-editor/auto-complete-editor.component';
import { LabelColumnRendererComponent } from '../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { patchOrganization, setOrganizationCountry } from '../store/actions/invoice.action';
import { Country } from '../store/model/country.model';
import { selectInvoice } from '../store/selectors/invoice.selectors';

export enum OrganizatonFormItem {
  NAME = 'Name',
  MOBILE = 'Mobile',
  EMAIL = 'Email',
  GSTIN = 'GSTIN',
  LINE1 = 'Address Address Line 1',
  LINE2 = 'Address Line 2',
  STREET = 'Street',
  CITY = 'City',
  STATE = 'State',
  ZIP = 'Zip',
  COUNTRY = 'Country',
}

@Component({
  selector: 'app-invoice-organization',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: './invoice-organization.component.html',
  styleUrl: './invoice-organization.component.scss',
})
export class InvoiceOrganizationComponent implements OnDestroy {
  public myDetailsGridApi!: GridApi<FormColumnDef>;
  private destroy$ = new Subject<void>();

  myDetailsRowData: FormColumnDef[] = [];

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

  constructor(private store: Store, private countryService: CountryService) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // eslint-disable-next-line class-methods-use-this
  getRowId = (params: GetRowIdParams<FormColumnDef>) => params.data.label;

  fetchCountries = (val?: string | Country): Observable<Country[]> => {
    return this.countryService.fetchCountries(val).pipe(takeUntil(this.destroy$));
  };

  private findMyDetailsEditorComponent = (params: ICellEditorParams<FormColumnDef>) => {
    switch (params.data.label) {
      case OrganizatonFormItem.COUNTRY:
        return this.findMyDetailsCountryEditorComponent(params.data.value);
    }
    return { component: null };
  };

  private handleMyDetailsCellValueChanged = (event: NewValueParams<FormColumnDef>) => {
    switch (event.data.label) {
      case OrganizatonFormItem.NAME:
        this.store.dispatch(patchOrganization({ organization: { name: event.newValue } }));
        break;
      case OrganizatonFormItem.LINE1:
        this.store.dispatch(patchOrganization({ organization: { addressLine1: event.newValue } }));
        break;
      case OrganizatonFormItem.LINE2:
        this.store.dispatch(patchOrganization({ organization: { addressLine2: event.newValue } }));
        break;
      case OrganizatonFormItem.STREET:
        this.store.dispatch(patchOrganization({ organization: { street: event.newValue } }));
        break;
      case OrganizatonFormItem.CITY:
        this.store.dispatch(patchOrganization({ organization: { city: event.newValue } }));
        break;
      case OrganizatonFormItem.ZIP:
        this.store.dispatch(patchOrganization({ organization: { zipCode: event.newValue } }));
        break;
      case OrganizatonFormItem.STATE:
        this.store.dispatch(patchOrganization({ organization: { state: event.newValue } }));
        break;
      case OrganizatonFormItem.EMAIL:
        this.store.dispatch(patchOrganization({ organization: { email: event.newValue } }));
        break;
      case OrganizatonFormItem.MOBILE:
        this.store.dispatch(patchOrganization({ organization: { phone: event.newValue } }));
        break;
      case OrganizatonFormItem.GSTIN:
        this.store.dispatch(patchOrganization({ organization: { gstin: event.newValue } }));
        break;
    }
  };

  myDetailsColumnDefs: ColDef<FormColumnDef>[] = [
    {
      field: 'label',
      headerName: '',
      flex: 1,
      cellRendererSelector: InvoiceOrganizationComponent.findLabelColumnRenderer,
    },
    {
      field: 'value',
      headerName: '',
      flex: 2,
      editable: true,
      cellEditorSelector: this.findMyDetailsEditorComponent,
      cellRendererSelector: InvoiceOrganizationComponent.findMyDetailsCellRenderer,
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
      onCellValueChanged: this.handleMyDetailsCellValueChanged,
    },
  ];

  handleMyDetailsCountryOptionSelected = (val: Country): void => {
    this.store.dispatch(setOrganizationCountry({ country: val }));
  };

  private findMyDetailsCountryEditorComponent = (_valueP: unknown) => ({
    component: AutoCompleteEditorComponent<Country>,
    params: {
      optionsFetcher: this.fetchCountries,
      displayWith: displayAutoCompleteWithName,
      onOptionSelected: this.handleMyDetailsCountryOptionSelected,
    },
  });

  private static findMyDetailsCellRenderer = (params: ICellRendererParams<FormColumnDef>) => {
    if (!params.data?.value) { return ''; }
    switch (params.data.label) {
      case OrganizatonFormItem.COUNTRY: {
        const dtF = params.data.value as Country;
        return {
          component: LabelColumnRendererComponent,
          params: { labelValue: dtF.name },
        };
      }
    }
    return params.data.value;
  };

  private static findLabelColumnRenderer = (params: ICellRendererParams<FormColumnDef>) => {
    let tooltip = '';
    switch (params.data?.label) {
      case OrganizatonFormItem.LINE1:
        tooltip = 'Address Line 1, First line of address';
        break;
      case OrganizatonFormItem.LINE2:
        tooltip = 'Address Line 2, Second line of address';
        break;
    }
    return {
      component: LabelColumnRendererComponent,
      params: { labelValue: params.data?.label ?? '', tooltip, maxLength: 10 },
    };
  };

  onMyDetailsGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.myDetailsGridApi = params.api;
    this.store
      .select(selectInvoice)
      .pipe(takeUntil(this.destroy$))
      .subscribe((invoice) => {
        const { organization } = invoice;
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
