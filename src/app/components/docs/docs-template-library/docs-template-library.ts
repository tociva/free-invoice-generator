import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  TngButtonComponent,
  TngCardComponent,
  TngProgressSpinnerComponent,
} from '@tailng-ui/components';
import { TngIcon } from '@tailng-ui/icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface DocumentationTemplate {
  slug: string;
  name: string;
  image: string | null;
  documentationTitle?: string;
  documentation: string;
}

interface CatalogTemplate {
  name: string;
  docs?: {
    slug: string;
    title?: string;
    body: string;
    image: string | null;
  };
}

interface CatalogGroup {
  items: CatalogTemplate[];
}

@Injectable({ providedIn: 'root' })
export class DocsTemplateLibraryService {
  readonly templates = signal<DocumentationTemplate[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly query = signal('');
  readonly page = signal(1);
}

@Component({
  selector: 'app-docs-template-library',
  imports: [RouterLink, TngButtonComponent, TngCardComponent, TngProgressSpinnerComponent, TngIcon],
  templateUrl: './docs-template-library.html',
  styleUrl: './docs-template-library.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsTemplateLibrary implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly state = inject(DocsTemplateLibraryService);

  readonly templates = this.state.templates;
  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly query = this.state.query;
  readonly page = this.state.page;
  readonly pageSize = 12;

  readonly filteredTemplates = computed(() => {
    const query = this.query().trim().toLowerCase();
    if (!query) return this.templates();

    return this.templates().filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        template.documentationTitle?.toLowerCase().includes(query),
    );
  });

  readonly displayedTemplates = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredTemplates().slice(start, start + this.pageSize);
  });

  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredTemplates().length / this.pageSize)),
  );

  readonly slug = signal<string | null>(this.route.snapshot.paramMap.get('slug'));

  readonly selectedTemplate = computed(() => {
    const slug = this.slug();
    if (!slug) return null;
    return this.templates().find((template) => template.slug === slug) ?? null;
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.slug.set(params.get('slug'));
    });
  }

  ngOnInit(): void {
    if (this.templates().length > 0) {
      this.loading.set(false);
      return;
    }
    this.http.get<CatalogGroup[]>('/invoice-templates/templates.json').subscribe({
      next: (groups) => {
        const templatesBySlug = new Map<string, DocumentationTemplate>();
        for (const item of groups.flatMap((group) => group.items)) {
          if (!item.docs || templatesBySlug.has(item.docs.slug)) continue;
          templatesBySlug.set(item.docs.slug, {
            slug: item.docs.slug,
            name: item.name.trim(),
            image: item.docs.image,
            documentationTitle: item.docs.title,
            documentation: item.docs.body,
          });
        }
        this.templates.set(
          [...templatesBySlug.values()].sort((left, right) =>
            left.name.localeCompare(right.name, undefined, { sensitivity: 'base', numeric: true }),
          ),
        );
        this.loading.set(false);
      },
      error: () => {
        this.error.set('The template library could not be loaded. Please try again.');
        this.loading.set(false);
      },
    });
  }

  updateSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.page.set(1);
  }

  previousPage(): void {
    this.page.update((page) => Math.max(1, page - 1));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  nextPage(): void {
    this.page.update((page) => Math.min(this.pageCount(), page + 1));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
