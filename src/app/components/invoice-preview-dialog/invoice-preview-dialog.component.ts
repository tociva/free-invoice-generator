import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA ,MatDialogModule} from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-preview-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './invoice-preview-dialog.component.html',
  styleUrls: ['./invoice-preview-dialog.component.scss']
})
export class InvoicePreviewDialogComponent {
  sanitizedHtml: SafeHtml;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { html: string },
    private sanitizer: DomSanitizer
  ) {
    const wrappedHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              margin: 0;
              background: white;
              color: #222;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }
          </style>
        </head>
        <body>${data.html}</body>
      </html>
    `;

    this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(wrappedHtml);
  }
}
