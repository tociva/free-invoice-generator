import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';

interface NgGridTextAreaInput {
  value: string;
  rows?: number;
}

@Component({
  selector: 'app-text-area-editor',
  imports: [CommonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule],
  templateUrl: './text-area-editor.component.html',
  styleUrl: './text-area-editor.component.scss'
})
export class TextAreaEditorComponent implements ICellEditorAngularComp {

  inputControl = new FormControl<string>('');
  rows = 5;

  @ViewChild('agTextArea') agTextArea!: ElementRef;
  
  agInit(params: ICellEditorParams & NgGridTextAreaInput): void {
    this.inputControl.setValue(params.value ?? '');
    this.rows = params.rows ?? 5;
  }
  getValue(): string {
    return this.inputControl?.value ?? '';
  }
}
