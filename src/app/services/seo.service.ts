import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot } from '@angular/router';

export interface SeoTags {
  title?: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  applyFromRoute(snapshot: ActivatedRouteSnapshot): void {
    const leaf = deepestSnapshot(snapshot);
    const description =
      typeof leaf.data['description'] === 'string' ? leaf.data['description'] : '';
    this.setTags({
      title: leaf.title || this.title.getTitle(),
      description,
    });
  }

  setTags(tags: SeoTags): void {
    if (tags.title) {
      this.title.setTitle(tags.title);
      this.meta.updateTag({ property: 'og:title', content: tags.title });
    }

    if (tags.description) {
      this.meta.updateTag({ name: 'description', content: tags.description });
      this.meta.updateTag({ property: 'og:description', content: tags.description });
    }
  }
}

function deepestSnapshot(snapshot: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  let current = snapshot;
  while (current.firstChild) {
    current = current.firstChild;
  }
  return current;
}
