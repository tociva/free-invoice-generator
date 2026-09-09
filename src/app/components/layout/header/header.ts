import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { TngPress } from '@tailng-ui/primitives';
import { provideAppIcon } from '../../../provider/icon-provider';

@Component({
  selector: 'app-header',
  imports: [TngPress, NgIcon, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideAppIcon()],
})
export class Header {
  menuOpen = signal(false);

  toggleMenu() {
    this.menuOpen.update((value) => !value);
  }
  closeMenu() {
    this.menuOpen.update((value) => !value);
  }
}
