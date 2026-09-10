import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TngIcon } from '@tailng-ui/icons/core';
import { AppThemeStore } from '../../../../theme';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { TngButtonComponent } from '@tailng-ui/components';
import { provideAppIcon } from '../../../provider/icon-provider';

@Component({
  selector: 'app-header',
  imports: [TngButtonComponent, TngIcon, NgIcon, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideAppIcon()],
})
export class Header {
  readonly theme = inject(AppThemeStore);
  menuOpen = signal(false);

  toggleMenu() {
    this.menuOpen.update((value) => !value);
  }
  closeMenu() {
    this.menuOpen.update((value) => !value);
  }
}
