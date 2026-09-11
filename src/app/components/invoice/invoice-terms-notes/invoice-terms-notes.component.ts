import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoice-terms-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-terms-notes.component.html',
  styleUrls: ['./invoice-terms-notes.component.scss']
})
export class InvoiceTermsNotesComponent {
  @Input() terms = '';
  @Input() notes = '';

  @Output() termsChange = new EventEmitter<string>();
  @Output() notesChange = new EventEmitter<string>();

  onTermsChange(value: string) {
    this.termsChange.emit(value);
  }

  onNotesChange(value: string) {
    this.notesChange.emit(value);
  }
}
