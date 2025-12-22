import { Component, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { provideAppIcon } from '../../../provider/icon-provider';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [NgIcon,RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
  providers:[provideAppIcon()]
})
export class Header {
  menuOpen = signal(false);

  toggleMenu(){
  this.menuOpen.update(value => !value);
  }
  closeMenu() {
  this.menuOpen.update(value => !value);
}

}
