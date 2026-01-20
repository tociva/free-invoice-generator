import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  constructor(private sanitizer: DomSanitizer) { }

  createWrappedSafeHtml(html: string): SafeHtml {
  const wrapperStyle = `
   <style>
  @page {
    size: A4;
    margin: 10mm;
  }

  @media print {
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: auto;
      overflow: visible;
    }

    * {
      box-sizing: border-box;
      max-width: 100%;
    }
  }
</style>

  `;

  return this.sanitizer.bypassSecurityTrustHtml(wrapperStyle + html);
}
}