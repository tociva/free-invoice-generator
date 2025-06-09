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
          margin: 0;
          padding: 0;
          transform: scale(0.5);
          transform-origin: top left;
          width: 200%;
          height: 200%;
          overflow: hidden;
        }
      </style>
    `;
    const finalHtml = wrapperStyle + html;
    return this.sanitizer.bypassSecurityTrustHtml(finalHtml);
  };
}
