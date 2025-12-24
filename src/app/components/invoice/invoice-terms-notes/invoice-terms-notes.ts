import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-terms-notes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-terms-notes.html',
  styleUrls: ['./invoice-terms-notes.css'],
})
export class InvoiceTermsNotesComponent implements OnInit {
  notes: string = '';
  terms: string = '';

  notesSig: WritableSignal<string> = signal(this.notes);
  termsSig: WritableSignal<string> = signal(this.terms);

  constructor() {}

  ngOnInit(): void {}
}
