import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TngButtonComponent, TngCommandPaletteComponent } from '@tailng-ui/components';
import { TngIcon } from '@tailng-ui/icons';
import { AppThemeStore } from '../../../../theme';
import { ADVANCED_INVOICE_STEPS, SIMPLE_INVOICE_STEPS } from '../../invoice/invoice-steps';

export interface HeaderSearchResult {
  id: string;
  label: string;
  category: 'Page' | 'Invoice Step' | 'External';
  description?: string;
  icon?: string;
  keywords?: string[];
  route?: string;
  url?: string;
  external?: boolean;
  queryParams?: Record<string, any>;
  onSelect?: () => void;
}

@Component({
  selector: 'app-header',
  imports: [TngButtonComponent, TngCommandPaletteComponent, TngIcon, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Header {
  readonly theme = inject(AppThemeStore);
  readonly router = inject(Router);

  menuOpen = signal(false);
  searchOpen = signal(false);
  paletteQuery = signal('');

  readonly isMac =
    typeof navigator !== 'undefined' &&
    /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent);
  readonly shortcutLabel = this.isMac ? 'Cmd K' : 'Ctrl K';

  @HostListener('document:keydown', ['$event'])
  onGlobalSearchShortcut(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openSearch();
    }
  }

  openSearch(): void {
    this.paletteQuery.set('');
    this.searchOpen.set(true);
  }

  onSearchOpenChange(open: boolean): void {
    if (open) {
      this.paletteQuery.set('');
    }
    this.searchOpen.set(open);
  }

  onInputChange(value: string): void {
    this.paletteQuery.set(value);
  }

  getOptionValue = (item: HeaderSearchResult): string => item.id;
  getOptionLabel = (item: HeaderSearchResult): string => item.label;
  getOptionDescription = (item: HeaderSearchResult): string => item.description ?? '';

  selectResult(item: HeaderSearchResult): void {
    this.searchOpen.set(false);
    this.paletteQuery.set('');

    if (item.onSelect) {
      item.onSelect();
    } else if (item.url) {
      if (item.external) {
        window.open(item.url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = item.url;
      }
    } else if (item.route) {
      this.router.navigate([item.route], {
        queryParams: item.queryParams,
      });
    }
  }

  toggleMenu(): void {
    this.menuOpen.update((value) => !value);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  readonly allSearchItems = computed<HeaderSearchResult[]>(() => {
    const items: HeaderSearchResult[] = [
      // Navigation Pages
      {
        id: 'page-home',
        label: 'Home',
        category: 'Page',
        description: 'Create professional invoices',
        icon: 'home',
        route: '/home',
        keywords: ['home', 'landing', 'start', 'create', 'dashboard'],
      },
      {
        id: 'page-templates',
        label: 'Templates',
        category: 'Page',
        description: 'Browse all invoice templates',
        icon: 'layout',
        route: '/templates',
        keywords: [
          'templates',
          'template',
          'all templates',
          'template page',
          'catalog',
          'gallery',
          'designs',
          'select a template',
        ],
      },
      {
        id: 'page-simple-invoice',
        label: 'SimpleInvoice',
        category: 'Page',
        description: 'Fast 3-step invoice generator',
        icon: 'zap',
        route: '/simple-invoice',
        keywords: ['simple', 'quick', 'easy', 'simpleinvoice', 'invoice'],
      },
      {
        id: 'page-advanced-invoice',
        label: 'Advanced Invoice',
        category: 'Page',
        description: 'Full-featured invoice builder',
        icon: 'layers',
        route: '/invoice',
        keywords: ['advanced', 'invoice', 'builder', 'generator'],
      },
      {
        id: 'page-docs',
        label: 'Docs',
        category: 'Page',
        description: 'Documentation and guides',
        icon: 'book-open',
        route: '/docs',
        keywords: ['docs', 'documentation', 'guide', 'help', 'api', 'reference'],
      },
      {
        id: 'external-github',
        label: 'GitHub',
        category: 'External',
        description: 'View project source and issues on GitHub',
        icon: 'code',
        url: 'https://github.com/tociva/free-invoice-generator',
        external: true,
        keywords: ['github', 'git hub', 'source', 'code', 'repository', 'open source', 'git'],
      },
    ];

    // Advanced Invoice Steps
    for (const step of ADVANCED_INVOICE_STEPS) {
      items.push({
        id: `invoice-step-${step.id}`,
        label: `Step ${step.id}: ${step.label}`,
        category: 'Invoice Step',
        description: 'Advanced Invoice',
        icon: 'file-text',
        route: '/invoice',
        queryParams: { step: step.id },
        keywords: ['invoice', 'step', String(step.id), ...step.label.toLowerCase().split(/\s+/)],
      });
    }

    // Simple Invoice Steps
    for (const step of SIMPLE_INVOICE_STEPS) {
      items.push({
        id: `simple-step-${step.id}`,
        label: `Simple Step ${step.id}: ${step.label}`,
        category: 'Invoice Step',
        description: 'Simple Invoice',
        icon: 'file-text',
        route: '/simple-invoice',
        queryParams: { step: step.id },
        keywords: [
          'simple',
          'invoice',
          'step',
          String(step.id),
          ...step.label.toLowerCase().split(/\s+/),
        ],
      });
    }

    return items;
  });

  readonly filteredResults = computed<HeaderSearchResult[]>(() => {
    const query = this.paletteQuery().toLowerCase().trim();
    const all = this.allSearchItems();
    if (!query) {
      return all;
    }
    return all.filter((item) => {
      if (item.label.toLowerCase().includes(query)) return true;
      if (item.description && item.description.toLowerCase().includes(query)) return true;
      if (item.keywords && item.keywords.some((k) => k.toLowerCase().includes(query))) return true;
      return false;
    });
  });
}
