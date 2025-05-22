import { ColDef, GridApi, GridReadyEvent, ICellEditorParams, ICellRendererParams } from "ag-grid-community";
import { map, Observable } from "rxjs";
import { OPTIONS_COUNT } from "../../../../util/constants";
import { displayAutoCompleteWithName } from "../../../../util/daybook.util";
import { FormColumnDef } from "../../../../util/form-column-def.type";
import { AutoCompleteEditorComponent } from "../../common/ag-grid/editor/auto-complete-editor/auto-complete-editor.component";
import { CheckboxColumnRendererComponent } from "../../common/ag-grid/renderer/checkbox-column-renderer/checkbox-column-renderer.component";
import { LabelColumnRendererComponent } from "../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component";
import { DatePickerCellEditor } from "../../common/date-picker-cell-editor/date-picker-cell-editor.component";
import { Currency } from "../store/model/currency.model";
import { selectAllCurrencies } from "../store/selectors/currency.selectors";
import { selectSelectedInvoiceDetails } from "../store/selectors/invoice-details.selectors";
import { selectAllTaxes } from "../store/selectors/tax.selectors";
import { CreateInvoiceItemsComponent } from "./create-invoice-items.component";

export enum InvoiceDetailsFormItem {
  INVOICE_NUMBER = 'Invoice Number',
  INVOICE_DATE = 'Invoice Date',
  DUE_DATE = 'Due Date',
  CURRENCY = 'Currency',
  DELIVERY_STATE = 'Delivery State',
  TAX_OPTION = 'Tax Option',
  ITEM_DESCRIPTION = 'Item Description',
  SHOW_DISCOUNT = 'Show Discount',
}

export class CreateInvoiceDetailsComponent extends CreateInvoiceItemsComponent {

  public detailsGridApi!: GridApi<FormColumnDef>;
  
  invoiceDetailsRowData: FormColumnDef[] = [];

  private changeCurrency(val: Currency): void {

    const rowNode = this.detailsGridApi.getRowNode(InvoiceDetailsFormItem.CURRENCY);
    if (rowNode) {
      const updated = { ...rowNode.data, value: val };
      rowNode.setData(updated as FormColumnDef);
    }
  }

  private fetchCurrencies = (val?: string | Currency): Observable<Currency[]> => {
    return this.store.select(selectAllCurrencies).pipe(
      map((currencies) => {
        // If val is of type Country, return empty array
        if (val && typeof val === 'object') {
          return [];
        }

        if (!val?.trim()) {
          return currencies.slice(0, OPTIONS_COUNT);
        }

        const filterVal = val.toLowerCase();
        return currencies
          .filter((currency) => currency.name.toLowerCase().startsWith(filterVal))
          .slice(0, OPTIONS_COUNT);
      })
    );
  };

  private fetchTaxOptions = (val?: string): Observable<string[]> => {
    return this.store.select(selectAllTaxes).pipe(
      map((taxes) => {
        if (!val?.trim()) {
          return taxes;
        }
        const filterVal = val.toLowerCase();
        return taxes.filter(option => option.toLowerCase().indexOf(filterVal) !== -1);
      })
    );
  };

  private handleCurrencyOptionSelected = (val: Currency): void => {
    // this.store.dispatch(setCurrency({ currency: val }));
  };

  private findCurrencyEditorComponent = (_valueP: unknown) => ({
    component: AutoCompleteEditorComponent<Currency>,
    params: {
      optionsFetcher: this.fetchCurrencies,
      displayWith: displayAutoCompleteWithName,
      onOptionSelected: this.handleCurrencyOptionSelected
    }
  });

  private findDetailsEditorComponent = (params: ICellEditorParams<FormColumnDef>) => {

    switch (params.data.label) {

      case InvoiceDetailsFormItem.INVOICE_DATE:
      case InvoiceDetailsFormItem.DUE_DATE:
        return { component: DatePickerCellEditor };

      case InvoiceDetailsFormItem.CURRENCY:
        return this.findCurrencyEditorComponent(params.data.value);

      case InvoiceDetailsFormItem.TAX_OPTION:
        return {
          component: AutoCompleteEditorComponent<string>,
          params: {
            optionsFetcher: this.fetchTaxOptions,
            displayWith: (params: string) => params,
            onOptionSelected: (val: string) => this.handleTaxOptionToggle(val)
          }
        };
    }

    return {
      component: null
    };

  };

  private handleItemDescriptionToggle = (val: boolean) => {
    this.itemDescriptionEnabled = val;
  };

  private handleShowDiscountToggle = (val: boolean) => {
    this.discountEnabled = val;
  };

  private findDetailsCellRenderer = (params: ICellRendererParams<FormColumnDef>) => {

    if (!params.data?.value) {

      return '';

    }
    switch (params.data.label) {

      case InvoiceDetailsFormItem.CURRENCY:
        const cur = params.data.value as Currency;
        return {
          component: LabelColumnRendererComponent,
          params: { labelValue: `(${cur.html ?? ''}) ${cur.name ?? ''}` }
        };
      case InvoiceDetailsFormItem.ITEM_DESCRIPTION:
        return { component: CheckboxColumnRendererComponent, params: { selected: false, onToggle: this.handleItemDescriptionToggle } };

      case InvoiceDetailsFormItem.SHOW_DISCOUNT:
        return { component: CheckboxColumnRendererComponent, params: { selected: false, onToggle: this.handleShowDiscountToggle } };

    }
    return params.data.value;

  };

  invoiceDetailsColumnDefs: ColDef<FormColumnDef>[] = [
    { field: 'label', headerName: '', width: 150 },
    {
      field: 'value',
      headerName: '',
      width: 200,
      editable: (params) => {
        const label = params.data?.label ?? '';
        const editableFields = [
          InvoiceDetailsFormItem.INVOICE_NUMBER,
          InvoiceDetailsFormItem.INVOICE_DATE,
          InvoiceDetailsFormItem.DUE_DATE,
          InvoiceDetailsFormItem.CURRENCY,
          InvoiceDetailsFormItem.DELIVERY_STATE,
          InvoiceDetailsFormItem.TAX_OPTION
        ];
        return editableFields.includes(label as InvoiceDetailsFormItem);
      },
      cellRendererSelector: this.findDetailsCellRenderer,
      cellEditorSelector: this.findDetailsEditorComponent,
    }
  ];

  onInvoiceDetailsGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.detailsGridApi = params.api;
    this.store.select(selectSelectedInvoiceDetails).subscribe((invoiceDetails) => {
      this.invoiceDetailsRowData = [
        { label: InvoiceDetailsFormItem.INVOICE_NUMBER, value: invoiceDetails.number },
        { label: InvoiceDetailsFormItem.INVOICE_DATE, value: invoiceDetails.date },
        { label: InvoiceDetailsFormItem.DUE_DATE, value: invoiceDetails.dueDate },
        { label: InvoiceDetailsFormItem.CURRENCY, value: invoiceDetails.currency },
        { label: InvoiceDetailsFormItem.DELIVERY_STATE, value: invoiceDetails.deliveryState },
        { label: InvoiceDetailsFormItem.TAX_OPTION, value: invoiceDetails.taxOption },
        { label: InvoiceDetailsFormItem.ITEM_DESCRIPTION, value: invoiceDetails.itemDescription },
        { label: InvoiceDetailsFormItem.SHOW_DISCOUNT, value: invoiceDetails.showDiscount },
        
      ];
    });
  }
}