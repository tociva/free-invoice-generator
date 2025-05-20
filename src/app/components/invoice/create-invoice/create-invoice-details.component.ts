import { ColDef, GridApi, GridReadyEvent, ICellRendererParams } from "ag-grid-community";
import { FormColumnDef } from "../../../../util/form-column-def.type";
import { LabelColumnRendererComponent } from "../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component";
import { CheckboxCellRendererComponent } from "../../common/checkbox-cell-renderer/checkbox-cell-renderer.component";
import { DatePickerCellEditor } from "../../common/date-picker-cell-editor/date-picker-cell-editor.component";
import { Currency } from "../store/model/country.model";
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

  invoiceColumnDefs: ColDef<FormColumnDef>[] = [
    { field: 'label', headerName: '', width: 150 },
    {
      field: 'value',
      headerName: '',
      width: 200,
      editable: (params) => {
        const label = params.data?.label ?? '';
        const editableFields = [InvoiceDetailsFormItem.INVOICE_NUMBER, InvoiceDetailsFormItem.INVOICE_DATE, InvoiceDetailsFormItem.DUE_DATE, InvoiceDetailsFormItem.CURRENCY, InvoiceDetailsFormItem.DELIVERY_STATE, InvoiceDetailsFormItem.TAX_OPTION];
        return editableFields.includes(label as InvoiceDetailsFormItem);
      },
      cellRendererSelector: CreateInvoiceDetailsComponent.findDetailsCellRenderer,
      cellEditorSelector: (params) => {
        const label = params.data?.label ?? '';
        const dateFields = [InvoiceDetailsFormItem.INVOICE_DATE, InvoiceDetailsFormItem.DUE_DATE];

        if (dateFields.includes(label as InvoiceDetailsFormItem)) {
          return { component: DatePickerCellEditor };
        }
        return undefined;
      }
    }
  ];



  private static findDetailsCellRenderer = (params:ICellRendererParams<FormColumnDef>) => {

    if (!params.data?.value) {

      return '';

    }
    switch (params.data.label) {

    case InvoiceDetailsFormItem.CURRENCY:
      const dtF = params.data.value as Currency;
      return {component: LabelColumnRendererComponent,
        params: {labelValue: dtF.name}};
    case InvoiceDetailsFormItem.ITEM_DESCRIPTION:
    case InvoiceDetailsFormItem.SHOW_DISCOUNT:
      return {component: CheckboxCellRendererComponent, value: false};

    }
    return params.data.value;
  
  };

  invoiceRowData: FormColumnDef[] = [
    { label: InvoiceDetailsFormItem.INVOICE_NUMBER, value: 'INV-1001' },
    { label: InvoiceDetailsFormItem.INVOICE_DATE, value: '2025-03-31' },
    { label: InvoiceDetailsFormItem.DUE_DATE, value: '2025-04-07' },
    { label: InvoiceDetailsFormItem.CURRENCY, value: {
      name: 'Indian Rupee',
      html: '&#8377;',
      unicode: '20B9',
      decimal: 2
    }},
    { label: InvoiceDetailsFormItem.DELIVERY_STATE, value: '32-Kerala' },
    { label: InvoiceDetailsFormItem.TAX_OPTION, value: 'CGST/SGST' },
    { label: InvoiceDetailsFormItem.ITEM_DESCRIPTION, value: 'true' },
    { label: InvoiceDetailsFormItem.SHOW_DISCOUNT, value: 'true' }
  ];

  onInvoiceDetailsGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.detailsGridApi = params.api;
  }

  changeCurrency(val: Currency): void {
    const rowNode = this.detailsGridApi.getRowNode(InvoiceDetailsFormItem.CURRENCY);
    if (rowNode) {
      const updated = { ...rowNode.data, value: val };
      rowNode.setData(updated as FormColumnDef);
    }
  }
}