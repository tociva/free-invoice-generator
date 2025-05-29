import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { Template } from '../../util/template.type';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  fetchAllTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>('invoice-templates/templates.json').pipe(
      switchMap((templates) => {
        const requests: Observable<void>[] = [];

        for (const template of templates) {
          for (const item of template.items) {
            const htmlRequest = this.http
              .get(item.path, { responseType: 'text' })
              .pipe(
                map((rawHtml) => {
                  item.html = this.sanitizer.bypassSecurityTrustHtml(rawHtml);
                })
              );

            requests.push(htmlRequest);
          }
        }

        return forkJoin(requests).pipe(map(() => templates));
      })
    );
  }

  fetchTemplate(path: string): Observable<string> {
    return this.http.get(path, { responseType: 'text' });
  }
}
