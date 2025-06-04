import { Component } from '@angular/core';
import { ColDef, ColGroupDef, GetRowIdParams, GridApi, GridReadyEvent, ICellRendererParams, NewValueParams } from 'ag-grid-community';
import { IconColumnRendererComponent } from '../../common/ag-grid/renderer/icon-column-renderer/icon-column-renderer.component';
import { LabelColumnRendererComponent } from '../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { addInvoiceItem, deleteInvoiceItem, updateInvoiceItem } from '../store/actions/invoice.action';
import { Invoice, InvoiceItem, TaxOption } from '../store/model/invoice.model';
import { selectInvoice } from '../store/selectors/invoice.selectors';
import { CreateInvoiceSummaryComponent } from './create-invoice-summary.component';
import { DEFAULT_DECIMAL_PLACES } from '../../../../util/constants';
import { currencyToFixedNumber, numberToFixedDecimal } from '../../../../util/invoice.util';

type InvoiceItemWithAction = InvoiceItem & { action?: string };

@Component({
  selector: 'app-create-invoice-items',
  standalone: true,
  template: '',
})
export class CreateInvoiceItemsComponent extends CreateInvoiceSummaryComponent {

  private decimalPlaces = DEFAULT_DECIMAL_PLACES;

  itemsDefaultColDef: ColDef<InvoiceItemWithAction> = {
    editable: false,
    width: 150,
    flex: 1,
    resizable: false,
    sortable: false,
    filter: false,
    floatingFilter: false,
  };

  itemsColumnDefs: ColDef<InvoiceItemWithAction>[] = [];
  itemsGridApi!: GridApi<InvoiceItem>;
  itemsGridWidth = '1000px';
  private numberCellWidth = 60;
  private nameCellWidth = 300;

  private handleNameCellValueChanged = (params: NewValueParams<InvoiceItem>) => {
    const { oldValue, data } = params;
    if (oldValue.trim().length) {return;}
    this.store.dispatch(addInvoiceItem({ item: data }));
  };

  private handleItemCellValueChanged = (params: NewValueParams<InvoiceItem>) => {
    const rowIndex = params.node?.rowIndex ?? 0;
    this.store.dispatch(updateInvoiceItem({ index: rowIndex, item: params.data }));
  };

  private createItemLabelStringColumn(field: keyof InvoiceItem, headerName: string, placeholder = '', width?: number, onCellValueChanged?: (event: any) => void, groupClass?: string): ColDef<InvoiceItemWithAction> {
    return {
      field,
      headerName,
      width,
      editable: true,
      headerClass: groupClass,
      cellClass: groupClass,
      cellRenderer: LabelColumnRendererComponent,
      cellRendererParams: (params: ICellRendererParams<InvoiceItem>) => {
        const value = params.data?.[field];
        const labelValue = typeof value === 'string' ? value.trim() : value?.toString();
        return {
          labelValue: labelValue && labelValue !== '0' ? labelValue : placeholder
        };
      },
      onCellValueChanged
    };
  }

  private createItemLabelNumberColumn(field: keyof InvoiceItem, headerName: string, editable = false, width?: number, onCellValueChanged?: (event: any) => void, groupClass?: string): ColDef<InvoiceItemWithAction> {
    return {
      field,
      headerName,
      width,
      editable,
      headerClass: groupClass,
      cellClass: groupClass,
      cellRenderer: LabelColumnRendererComponent,
      cellRendererParams: (params: ICellRendererParams<InvoiceItem>) => {
        const value = params.data?.[field];
        const labelValue = typeof value === 'string' ? value.trim() : value?.toString();
        return {
          labelValue: labelValue && labelValue !== '0' ? labelValue : '',
          decimalPlaces: this.decimalPlaces,
          labelClass: 'content-label-right'
        };
      },
      onCellValueChanged
    };
  }

  private createItemLabelFormatedNumberColumn(field: keyof InvoiceItem, headerName: string, editable = false, width?: number, onCellValueChanged?: (event: any) => void, groupClass?: string): ColDef<InvoiceItemWithAction> {
    return {
      field,
      headerName,
      width,
      editable,
      headerClass: groupClass,
      cellClass: groupClass,
      cellRenderer: LabelColumnRendererComponent,
      cellRendererParams: (params: ICellRendererParams<InvoiceItem>) => {
        const value = params.data?.[field];
        const labelValue = typeof value === 'string' ? value.trim() : value?.toString();
        const formattedLabelValue = numberToFixedDecimal(Number(labelValue), this.decimalPlaces);
        return {
          labelValue: labelValue && labelValue !== '0' ? formattedLabelValue : '',
          labelClass: 'content-label-right'
        };
      },
      onCellValueChanged
    };
  }

  private createItemsColumnDefs(invoice: Invoice): void {
    const itemsColumnDefsTemp: ColGroupDef<InvoiceItemWithAction>[] = [];

    // Define group classes
    const itemDetailsGroupClass = 'item-details-group';
    const discountGroupClass = 'discount-group';
    const taxGroupClass = 'tax-group';
    const grandTotalClass = 'grand-total-group';

    // Item Details Group
    const itemColumns: ColGroupDef<InvoiceItemWithAction> = {
      headerName: 'Item Details',
      headerClass: itemDetailsGroupClass,
      children: [
        this.createItemLabelStringColumn('name', 'Name', 'Click here to add item name', this.nameCellWidth, this.handleNameCellValueChanged, ),
        this.createItemLabelFormatedNumberColumn('price', 'Price', true, this.numberCellWidth, this.handleItemCellValueChanged, ),
        this.createItemLabelNumberColumn('quantity', 'Quantity', true, this.numberCellWidth, this.handleItemCellValueChanged, ),
        this.createItemLabelFormatedNumberColumn('itemTotal', 'Item Total', false, this.numberCellWidth, this.handleItemCellValueChanged, )
      ]
    };

    if (invoice.hasItemDescription) {
      itemColumns.children.splice(
        1,
        0,
        this.createItemLabelStringColumn('description', 'Description', 'Click here to add description', this.nameCellWidth, this.handleNameCellValueChanged, )
      );
    }

    itemsColumnDefsTemp.push(itemColumns);

    // Discount Group
    if (invoice.hasItemDiscount) {
      itemsColumnDefsTemp.push({
        headerName: 'Discount',
        headerClass: discountGroupClass,
        children: [
          this.createItemLabelNumberColumn('discPercentage', 'Percentage', true, this.numberCellWidth, this.handleItemCellValueChanged, ),
          this.createItemLabelFormatedNumberColumn('discountAmount', 'value', false, this.numberCellWidth, this.handleItemCellValueChanged, ),
          this.createItemLabelFormatedNumberColumn('subTotal', 'Sub Total', false, this.numberCellWidth, this.handleItemCellValueChanged, )
        ]
      });
    }

    // Tax Group
    if (invoice.taxOption === TaxOption.CGST_SGST) {
      itemsColumnDefsTemp.push({
        headerName: 'Tax',
        headerClass: taxGroupClass,
        children: [
          this.createItemLabelNumberColumn('tax1Percentage', 'CGST %', true, this.numberCellWidth, this.handleItemCellValueChanged, ),
          this.createItemLabelFormatedNumberColumn('tax1Amount', 'Value', false, this.numberCellWidth, this.handleItemCellValueChanged, ),
          this.createItemLabelNumberColumn('tax2Percentage', 'SGST %', true, this.numberCellWidth, this.handleItemCellValueChanged, ),
          this.createItemLabelFormatedNumberColumn('tax2Amount', 'Value', false, this.numberCellWidth, this.handleItemCellValueChanged, ),
          this.createItemLabelFormatedNumberColumn('taxTotal', 'Tax Total', false, this.numberCellWidth, this.handleItemCellValueChanged, )
        ]
      });
    } else if (invoice.taxOption === TaxOption.IGST) {
      itemsColumnDefsTemp.push({
        headerName: 'Tax',
        headerClass: taxGroupClass,
        children: [
          this.createItemLabelNumberColumn('tax1Percentage', 'IGST %', true, this.numberCellWidth, this.handleItemCellValueChanged, ),
          this.createItemLabelFormatedNumberColumn('tax1Amount', 'Value', false, this.numberCellWidth, this.handleItemCellValueChanged, ),
          this.createItemLabelFormatedNumberColumn('taxTotal', 'Tax Total', false, this.numberCellWidth, this.handleItemCellValueChanged, )
        ]
      });
    }
    itemsColumnDefsTemp.push({
      headerName: '',
      headerClass:grandTotalClass,
      children: [
        this.createItemLabelFormatedNumberColumn('grandTotal', 'Grand Total', false, this.numberCellWidth, this.handleItemCellValueChanged,),
        {
          field: 'action',
          editable: false,
          headerName: '',
          width: 80,
          flex: 1,
          cellRenderer: IconColumnRendererComponent,
          cellRendererParams: {
            icon: 'delete',
            customClass: 'icon-danger',
            iconClickListener: (rowId: string) => {
              const rowIndex = Number(rowId);
              this.store.dispatch(deleteInvoiceItem({ index: rowIndex }));
            }
          }
        }
      ]
    });


    this.itemsColumnDefs = itemsColumnDefsTemp;
  }

  private setNumberCellWidth(invoice: Invoice): void {
    this.numberCellWidth = 110 - (invoice.hasItemDiscount ? 25 : 0);
    const extraColumns = invoice.hasItemDiscount ? 3 : 0;
    if (invoice.taxOption === TaxOption.CGST_SGST) {
      this.itemsGridWidth = `${600 + this.numberCellWidth * (9 + extraColumns) + 50 + 35}px`;
    } else if (invoice.taxOption === TaxOption.IGST) {
      this.itemsGridWidth = `${600 + this.numberCellWidth * (7 + extraColumns) + 50 + 35}px`;
    } else if (invoice.taxOption === TaxOption.NON_TAXABLE) {
      this.itemsGridWidth = `${600 + this.numberCellWidth * (4 + extraColumns) + 50 + 35}px`;
    }
  }

  onItemsGridReady(params: GridReadyEvent<InvoiceItem>): void {
    this.itemsGridApi = params.api;
    this.store.select(selectInvoice).subscribe((invoice) => {
      this.decimalPlaces = invoice.decimalPlaces ?? DEFAULT_DECIMAL_PLACES;
      this.setNumberCellWidth(invoice);
      this.createItemsColumnDefs(invoice);
      const items = invoice.items.map((item) => ({ ...item }));
      const itemsRowData: InvoiceItem[] = [...items, {
        name: '', description: '', quantity: 0, price: 0, itemTotal: 0, discountAmount: 0,
        discPercentage: 0, subTotal: 0, tax1Amount: 0, tax1Percentage: 0,
        tax2Amount: 0, tax2Percentage: 0, tax3Amount: 0, tax3Percentage: 0,
        taxTotal: 0, grandTotal: 0,
      }];
      const allRows = this.itemsGridApi.getDisplayedRowCount();
      const existingData = [];
      for (let i = 0; i < allRows; i++) {
        const rowNode = this.itemsGridApi.getDisplayedRowAtIndex(i);
        if (rowNode?.data) {existingData.push(rowNode.data);}
      }
      this.itemsGridApi.applyTransaction({ remove: existingData, add: itemsRowData });
      this.itemsGridApi.sizeColumnsToFit();
    });
  }
}
