// import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
// import { initialTemplateState } from './template.state';
// import { Template } from './template.model';
// import { firstValueFrom } from 'rxjs';
// import { HttpClient } from '@angular/common/http';
// import { DomSanitizer } from '@angular/platform-browser';

// let _http: HttpClient;
// let _sanitizer: DomSanitizer;

// export function initTemplateStore(http: HttpClient, sanitizer: DomSanitizer) {
//   _http = http;
//   _sanitizer = sanitizer;
//   return templateStore;
// }   
// export const templateStore = signalStore(
//   withState(initialTemplateState),
//   withMethods((store) => ({
//     async loadTemplate() {
//       patchState(store, { isLoaded: true, error: null });
//       setTimeout(() => this.loadloadTemplateSuccess(), 500);
//     },
//     async loadloadTemplateSuccess() {
//       try {
//         const templates : Template[] = await firstValueFrom(_http.get<Template[]>('/invoice-templates/templates.json'));
//         const allitems
//       } catch {}
//     },
//   }))
// );
