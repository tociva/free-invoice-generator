import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent, ICellRendererParams, NewValueParams } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DEFAULT_DECIMAL_PLACES } from '../../../../util/constants';
import { BASE_ITEM_ROW_DATA, numberToFixedDecimal } from '../../../../util/invoice.util';
import { IconColumnRendererComponent } from '../../common/ag-grid/renderer/icon-column-renderer/icon-column-renderer.component';
import { LabelColumnRendererComponent } from '../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { addInvoiceItem, deleteInvoiceItem, updateInvoiceItem } from '../store/actions/invoice.action';
import { Invoice, InvoiceItem, TaxOption } from '../store/model/invoice.model';
import { selectInvoice } from '../store/selectors/invoice.selectors';

type InvoiceItemWithAction = InvoiceItem & { action?: string, rowIndex?: number };
@Component({
  selector: 'app-invoice-items',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule
],
  templateUrl: './invoice-items.component.html',
  styleUrl: './invoice-items.component.scss'
})
export class InvoiceItemsComponent implements OnDestroy {
  
  @Input() simple = false;
  
  private decimalPlaces = DEFAULT_DECIMAL_PLACES;

  private destroy$ = new Subject<void>();

  itemsDefaultColDef: ColDef<InvoiceItemWithAction> = {
    editable: false,
    singleClickEdit: true,
    width: 150,
    flex: 1,
    resizable: false,
    sortable: false,
    filter: false,
    floatingFilter: false,
  };

  gridOptions: GridOptions<InvoiceItemWithAction> = {
    suppressMenuHide: true,
    rowSelection: 'single',
    animateRows: true
  };

  itemsColumnDefs: ColDef<InvoiceItemWithAction>[] = [];
  itemsGridApi!: GridApi<InvoiceItemWithAction>;
  itemsGridWidth = '1000px';
  private numberCellWidth = 60;
  private nameCellWidth = 300;

  constructor(private store:Store) {}
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleNameCellValueChanged = (params: NewValueParams<InvoiceItem>) => {
    const { oldValue, data } = params;
    if (oldValue.trim().length) {
      return;
    }
    const {description} = data;
    if(description.trim().length) {
      const rowIndex = params.node?.rowIndex ?? 0;
      this.store.dispatch(updateInvoiceItem({ index: rowIndex, item: {...data} }));
      return;
    }
    this.store.dispatch(addInvoiceItem({ item: {...data} }));
  };

  private handleDescriptionCellValueChanged = (params: NewValueParams<InvoiceItem>) => {
    const { oldValue, data } = params;
    if (oldValue.trim().length) {
      return;
    }
    const {name} = data;
    if(name.trim().length) {
      const rowIndex = params.node?.rowIndex ?? 0;
      this.store.dispatch(updateInvoiceItem({ index: rowIndex, item: {...data} }));
      return;
    }
    this.store.dispatch(addInvoiceItem({ item: {...data} }));
  };

  private handleItemCellValueChanged = (params: NewValueParams<InvoiceItem>) => {
    const rowIndex = params.node?.rowIndex ?? 0;
    const data = {...params.data};
    this.store.dispatch(updateInvoiceItem({ index: rowIndex, item: data }));
  };

  private static createItemLabelStringColumn(field: keyof InvoiceItem, headerName: string, placeholder = '', width?: number, onCellValueChanged?: (event: NewValueParams<InvoiceItem>) => void, groupClass?: string): ColDef<InvoiceItemWithAction> {
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

  private createItemLabelNumberColumn(field: keyof InvoiceItem, headerName: string, editable = false, width?: number, onCellValueChanged?: (event: NewValueParams<InvoiceItem>) => void, groupClass?: string): ColDef<InvoiceItemWithAction> {
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

  private createItemLabelFormatedNumberColumn(field: keyof InvoiceItem, headerName: string, editable = false, width?: number, onCellValueChanged?: (event: NewValueParams<InvoiceItem>) => void, groupClass?: string): ColDef<InvoiceItemWithAction> {
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

  private removeItemRow = (rowId: string) => {
    const rowData = this.itemsGridApi.getRowNode(rowId);
    if(!rowData?.data ) {
      return;
    }
    const rowIndex = rowData.data.rowIndex ?? 0;
    this.store.dispatch(deleteInvoiceItem({ index: rowIndex }));
  };

  private createItemsColumnDefs(invoice: Invoice): void {
    const itemsGroupColumnDefsTemp: ColGroupDef<InvoiceItemWithAction>[] = [];
    const itemsColumnDefsTemp: ColDef<InvoiceItemWithAction>[] = [];

    // Define group classes
    const oddGroupClass = 'odd-group-column';
    const evenGroupClass = 'even-group-column';

    const itemDetailsGroupClass = oddGroupClass;
    const discountGroupClass = evenGroupClass;
    const taxGroupClass = invoice.hasItemDiscount ? oddGroupClass : evenGroupClass;
    const grandTotalClass = invoice.hasItemDiscount ? evenGroupClass : oddGroupClass;

    // Item Details Group
    const itemDetailsColumns: ColDef<InvoiceItemWithAction>[] = [
      InvoiceItemsComponent.createItemLabelStringColumn('name', 'Name', 'Click here to add item name', this.nameCellWidth, this.handleNameCellValueChanged, itemDetailsGroupClass),
      this.createItemLabelFormatedNumberColumn('price', 'Price', true, this.numberCellWidth, this.handleItemCellValueChanged, itemDetailsGroupClass),
      this.createItemLabelNumberColumn('quantity', 'Quantity', true, this.numberCellWidth, this.handleItemCellValueChanged, itemDetailsGroupClass),
      this.createItemLabelFormatedNumberColumn('itemTotal', 'Item Total', false, this.numberCellWidth, this.handleItemCellValueChanged, itemDetailsGroupClass)
    ];

    if (invoice.hasItemDescription) {
      const descriptionColumn = InvoiceItemsComponent.createItemLabelStringColumn('description', 'Description', 'Click here to add description', this.nameCellWidth, this.handleDescriptionCellValueChanged, itemDetailsGroupClass);
      itemDetailsColumns.splice(
        1,
        0,
        descriptionColumn
      );
    }

    const itemHeaderColumn: ColGroupDef<InvoiceItemWithAction> = {
      headerName: 'Item Details',
      headerClass: itemDetailsGroupClass,
      children: itemDetailsColumns
    };
    itemsColumnDefsTemp.push(...itemDetailsColumns);
    itemsGroupColumnDefsTemp.push(itemHeaderColumn);

    // Discount Group
    if (invoice.hasItemDiscount) {
      const discountColumns: ColDef<InvoiceItemWithAction>[] = [
        this.createItemLabelNumberColumn('discPercentage', '%', true, this.numberCellWidth, this.handleItemCellValueChanged, discountGroupClass),
        this.createItemLabelFormatedNumberColumn('discountAmount', 'value', false, this.numberCellWidth, this.handleItemCellValueChanged, discountGroupClass),
        this.createItemLabelFormatedNumberColumn('subTotal', 'Sub Total', false, this.numberCellWidth, this.handleItemCellValueChanged, discountGroupClass)
      ];
      itemsGroupColumnDefsTemp.push({
        headerName: 'Discount',
        headerClass: discountGroupClass,
        children: discountColumns
      });
      itemsColumnDefsTemp.push(...discountColumns);
    }

    // Tax Group
    if (invoice.taxOption === TaxOption.CGST_SGST) {
      const taxColumns: ColDef<InvoiceItemWithAction>[] = [
        this.createItemLabelNumberColumn('tax1Percentage', 'CGST %', true, this.numberCellWidth, this.handleItemCellValueChanged, taxGroupClass),
        this.createItemLabelFormatedNumberColumn('tax1Amount', 'Value', false, this.numberCellWidth, this.handleItemCellValueChanged, taxGroupClass),
        this.createItemLabelNumberColumn('tax2Percentage', 'SGST %', true, this.numberCellWidth, this.handleItemCellValueChanged, taxGroupClass),
        this.createItemLabelFormatedNumberColumn('tax2Amount', 'Value', false, this.numberCellWidth, this.handleItemCellValueChanged, taxGroupClass),
        this.createItemLabelFormatedNumberColumn('taxTotal', 'Tax Total', false, this.numberCellWidth, this.handleItemCellValueChanged, taxGroupClass)
      ];
        itemsGroupColumnDefsTemp.push({
        headerName: 'Tax',
        headerClass: taxGroupClass,
        children: taxColumns
      });
      itemsColumnDefsTemp.push(...taxColumns);
    } else if (invoice.taxOption === TaxOption.IGST) {
      const taxColumns: ColDef<InvoiceItemWithAction>[] = [
        this.createItemLabelNumberColumn('tax1Percentage', 'IGST %', true, this.numberCellWidth, this.handleItemCellValueChanged, taxGroupClass),
        this.createItemLabelFormatedNumberColumn('tax1Amount', 'Value', false, this.numberCellWidth, this.handleItemCellValueChanged, taxGroupClass),
      ];
      itemsGroupColumnDefsTemp.push({
        headerName: 'Tax',
        headerClass: taxGroupClass,
        children: taxColumns
      });
      itemsColumnDefsTemp.push(...taxColumns);
    }
    if(invoice.taxOption !== TaxOption.NON_TAXABLE || invoice.hasItemDiscount) {
      const grandTotalColumn: ColDef<InvoiceItemWithAction> = this.createItemLabelFormatedNumberColumn('grandTotal', 'Grand Total', false, this.numberCellWidth, this.handleItemCellValueChanged, grandTotalClass);
      itemsColumnDefsTemp.push(grandTotalColumn);
      itemsGroupColumnDefsTemp.push({
        headerName: '',
        headerClass:grandTotalClass,
        children: [grandTotalColumn]
      });
      itemsColumnDefsTemp.push(grandTotalColumn);
    }
    const actionColumn: ColDef<InvoiceItemWithAction> = {
      field: 'action',
      editable: false,
      headerName: '',
      width: 80,
      flex: 1,
      headerClass: grandTotalClass,
      cellClass: grandTotalClass,
      cellRendererSelector: (params: ICellRendererParams<InvoiceItemWithAction>) => {
        const rowIndex = params.node.rowIndex;
        const totalRows = params.api.getDisplayedRowCount();
    
        if (rowIndex === totalRows - 1) {
          return undefined;
        }
        return {component: IconColumnRendererComponent,
          params: {icon: 'delete', customClass: 'icon-danger', iconClickListener: this.removeItemRow}};
      }
    };
    itemsGroupColumnDefsTemp.push({
      headerName: '',
      headerClass:grandTotalClass,
      children: [
        actionColumn
      ]
    });
    itemsColumnDefsTemp.push(actionColumn);

    if(invoice.taxOption === TaxOption.NON_TAXABLE && !invoice.hasItemDiscount) {
      this.itemsColumnDefs = itemsColumnDefsTemp;
    } else {
      this.itemsColumnDefs = itemsGroupColumnDefsTemp;
    }
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

  private refreshItemTable = (invoice: Invoice) => {
    this.decimalPlaces = invoice.decimalPlaces ?? DEFAULT_DECIMAL_PLACES;
    this.setNumberCellWidth(invoice);
    this.createItemsColumnDefs(invoice);
    const items = invoice.items.map((item) => ({ ...item }));
    const itemsRowData: InvoiceItem[] = [...items, {...BASE_ITEM_ROW_DATA}];
    const allRows = this.itemsGridApi.getDisplayedRowCount();
    const existingData = [];
    for (let i = 0; i < allRows; i++) {
      const rowNode = this.itemsGridApi.getDisplayedRowAtIndex(i);
      if (rowNode?.data) {existingData.push(rowNode.data);}
    }
    this.itemsGridApi.applyTransaction({ remove: existingData, add: itemsRowData });
    this.itemsGridApi.sizeColumnsToFit();
  };

  onItemsGridReady(params: GridReadyEvent<InvoiceItemWithAction>): void {
    this.itemsGridApi = params.api;
    this.store.select(selectInvoice)
    .pipe(takeUntil(this.destroy$))
    .subscribe((invoice) => {
      this.refreshItemTable(invoice);
      const nInvoices:InvoiceItemWithAction[] = [...invoice.items, {...BASE_ITEM_ROW_DATA}];
      for(const [index, item] of nInvoices.entries()) {
        const rowNode = this.itemsGridApi.getDisplayedRowAtIndex(index);
        if(rowNode) {
          rowNode.setData({...item, rowIndex: index});
        } else {
          this.itemsGridApi.applyTransaction({ add: [{...item, rowIndex: index}] });
        }
      }
      const totalRows = this.itemsGridApi.getDisplayedRowCount();
      const extraRowCount = totalRows - nInvoices.length;
      if(extraRowCount > 0) {
        const allRows:InvoiceItem[] = [];
        this.itemsGridApi.forEachNode((node) => {
          allRows.push(node.data as InvoiceItem);
        });
        const rowsToRemove = allRows.slice(-extraRowCount);
        this.itemsGridApi.applyTransaction({ remove: rowsToRemove });
      }
    });
  }
}
