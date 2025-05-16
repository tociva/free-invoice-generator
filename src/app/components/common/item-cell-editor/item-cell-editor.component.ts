import { Component, ElementRef, ViewChild } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { FormsModule } from '@angular/forms';


@Component({
   selector: 'app-item-cell-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './item-cell-editor.component.html',
  styleUrl: './item-cell-editor.component.scss'
})
export class ItemCellEditorComponent implements ICellEditorAngularComp {
  value: string = '';

   @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;


  agInit(params: any): void {
    this.value = params.value || '';
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.inputRef.nativeElement.focus(), 0);
  }

  getValue(): any {
    return this.value;
  }

  // Optional
  refresh(): boolean {
    return false;
  }
}
