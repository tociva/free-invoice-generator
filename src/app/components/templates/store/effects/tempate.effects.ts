import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as TemplateActions from '../actions/template.actions';
import * as TagActions from '../actions/tag.actions';
import { Template } from '../model/template.model';

@Injectable()
export class TemplateEffects {
  constructor(private actions$: Actions, private http: HttpClient) {}


  loadTemplates$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TemplateActions.loadTemplates),
      mergeMap(() =>
        this.http.get<Template[]>('/invoice-templates/templates.json').pipe(
          mergeMap((templates: Template[]) => {
            const templateItems = templates.flatMap((t) => t.items);
            const allTags = templateItems.flatMap(item => item.tags ?? []);
            const uniqueTags = Array.from(new Set(allTags));
  
            return [
              TemplateActions.loadTemplatesSuccess({ templates, templateItems }),
              TagActions.loadTags({ tags: uniqueTags })
            ];
          }),
          catchError((error) =>
            of(TemplateActions.loadTemplatesFailure({ error: error.message }))
          )
        )
      )
    )
  );

}
