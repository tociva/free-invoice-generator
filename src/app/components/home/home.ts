import { Component } from '@angular/core';
import { provideAppIcon } from '../../provider/icon-provider';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-home',
  imports: [NgIcon],
  templateUrl: './home.html',
  styleUrl: './home.css',
  providers :[provideAppIcon()],
})
export class Home {
  

}
