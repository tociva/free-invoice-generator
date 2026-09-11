import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TngIcon } from '@tailng-ui/icons';
import { AppThemeStore } from '../../../../theme';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TngButtonComponent } from '@tailng-ui/components';

@Component({
  selector: 'app-header',
  imports: [TngButtonComponent, TngIcon, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Header {
  readonly theme = inject(AppThemeStore);
  menuOpen = signal(false);

  toggleMenu() {
    this.menuOpen.update((value) => !value);
  }
  closeMenu() {
    this.menuOpen.set(false);
  }
}
