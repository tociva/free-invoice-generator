import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Footer } from './components/layout/footer/footer';
import { Header } from './components/layout/header/header';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class App {
  protected readonly title = signal('free-invoice-generator-2.0');
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart) {
        delete this.document.documentElement.dataset['routeReady'];
        return;
      }

      if (!(event instanceof NavigationEnd)) {
        return;
      }

      const path =
        this.document.defaultView?.location.pathname ??
        event.urlAfterRedirects.split(/[?#]/, 1)[0] ??
        '/';
      this.seo.applyFromRoute(this.router.routerState.snapshot.root);
      this.document.documentElement.dataset['routeReady'] = path;
    });
  }
}
