import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoice-terms-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-terms-notes.html',
  styleUrls: ['./invoice-terms-notes.css'],
})
export class InvoiceTermsNotesComponent implements OnInit {
  notes: string = '';
  terms: string = '';

  ngOnInit(): void {}
}
