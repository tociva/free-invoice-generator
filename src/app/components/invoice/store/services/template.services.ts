import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  constructor(private sanitizer: DomSanitizer) { }

  createWrappedSafeHtml = (html: string): SafeHtml => {
    const wrapperStyle = `
      <style>
        html, body {
          overflow: hidden;
        }
      </style>
    `;
    const finalHtml = wrapperStyle + html;
    return this.sanitizer.bypassSecurityTrustHtml(finalHtml);
  };
}
