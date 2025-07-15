import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
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
  NewValueParams,
  SuppressKeyboardEventParams
} from 'ag-grid-community';
import { Observable, Subject, takeUntil } from 'rxjs';
import { displayAutoCompleteWithName } from '../../../../util/daybook.util';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { CountryService } from '../../../services/country.service';
import { AutoCompleteEditorComponent } from '../../common/ag-grid/editor/auto-complete-editor/auto-complete-editor.component';
import { TextAreaEditorComponent } from '../../common/ag-grid/editor/text-area-editor/text-area-editor.component';
import { LabelColumnRendererComponent } from '../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { patchOrganization, setOrganizationCountry } from '../store/actions/invoice.action';
import { Country } from '../store/model/country.model';
import { selectInvoice } from '../store/selectors/invoice.selectors';

export enum OrganizatonFormItem {
  NAME = 'My Name',
  ADDRESS = 'My Address',
  AUTHPORITY_NAME = 'Authority Name',
  DESIGNATION = 'Designation',
  MOBILE = 'Mobile',
  EMAIL = 'Email',
  GSTIN = 'GSTIN',
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

  @Input() simple = false;

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
    getRowHeight: (params) => {
      switch (params.data?.label) {
        case OrganizatonFormItem.ADDRESS:
          return 170;
        default:
          return 50;
      }
    },
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
      case OrganizatonFormItem.ADDRESS:
        return { component: TextAreaEditorComponent, params: { value: params.data.value, rows: 10 } };
    }
    return { component: null };
  };

  private handleMyDetailsCellValueChanged = (event: NewValueParams<FormColumnDef>) => {
    switch (event.data.label) {
      case OrganizatonFormItem.NAME:
        this.store.dispatch(patchOrganization({ organization: { name: event.newValue } }));
        break;
      case OrganizatonFormItem.AUTHPORITY_NAME:
        this.store.dispatch(patchOrganization({ organization: { authorityName: event.newValue } }));
        break;
      case OrganizatonFormItem.DESIGNATION:
        this.store.dispatch(patchOrganization({ organization: { authorityDesignation: event.newValue } }));
        break;
      case OrganizatonFormItem.ADDRESS:
        this.store.dispatch(patchOrganization({ organization: { address: event.newValue } }));
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
      cellRendererSelector: InvoiceOrganizationComponent.findOrganizationCellRenderer,
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
      suppressKeyboardEvent: (params: SuppressKeyboardEventParams<FormColumnDef>) => {
        switch (params.data?.label) {
          case OrganizatonFormItem.ADDRESS:
            return params.editing && params.event.key === 'Enter';
        }
        return false;
      },
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

  private static findOrganizationCellRenderer = (params: ICellRendererParams<FormColumnDef>) => {
    switch (params.data?.label) {
      case OrganizatonFormItem.COUNTRY: {
        const dtF = params.data?.value as Country;
        return {
          component: LabelColumnRendererComponent,
          params: { labelValue: dtF?.name ?? '' },
        };
      }
      case OrganizatonFormItem.NAME: {
        let labelValueName = params.data?.value;
        if(!labelValueName) {
          labelValueName = 'Type your name here';
        }
        return {
          component: LabelColumnRendererComponent,
          params: { labelValue: labelValueName, multiLine: true },
        };
      }
      case OrganizatonFormItem.ADDRESS: {
        let labelValueAddress = params.data?.value;
        if(!labelValueAddress) {
          labelValueAddress = 'Type your address here';
        }
        return {
          component: LabelColumnRendererComponent,
          params: { labelValue: labelValueAddress, multiLine: true },
        };
      }
    }
    return params.data?.value ?? '';
  };

  private static findLabelColumnRenderer = (params: ICellRendererParams<FormColumnDef>) => {
    let tooltip = '';
    switch (params.data?.label) {
      case OrganizatonFormItem.AUTHPORITY_NAME:
        tooltip = 'Authority Name';
        break;
      case OrganizatonFormItem.DESIGNATION:
        tooltip = 'Designation';
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
        const myDetailsRowDataTemp:FormColumnDef[] = [
          { label: OrganizatonFormItem.NAME, value: organization.name },
          { label: OrganizatonFormItem.ADDRESS, value: organization.address },
          
        ];
        if(!this.simple) {
          myDetailsRowDataTemp.push({ label: OrganizatonFormItem.COUNTRY, value: organization.country },
            { label: OrganizatonFormItem.EMAIL, value: organization.email },
            { label: OrganizatonFormItem.MOBILE, value: organization.phone },
            { label: OrganizatonFormItem.GSTIN, value: organization.gstin },
            { label: OrganizatonFormItem.AUTHPORITY_NAME, value: organization.authorityName },
            { label: OrganizatonFormItem.DESIGNATION, value: organization.authorityDesignation },);
        }
        this.myDetailsRowData = myDetailsRowDataTemp; 
      });
  }
}
