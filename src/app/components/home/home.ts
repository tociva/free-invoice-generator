import { Component, inject } from '@angular/core';
import { provideAppIcon } from '../../provider/icon-provider';
import { NgIcon } from '@ng-icons/core';
import { Router } from '@angular/router';
import { FileUpload } from '../shared/file-upload/file-upload';

@Component({
  selector: 'app-home',
  imports: [NgIcon,FileUpload],
  templateUrl: './home.html',
  styleUrl: './home.css',
  providers :[provideAppIcon()],
})
export class Home {

  router = inject(Router);

  goToInvoiceCreator = () => {
    this.router.navigate(['/simple-invoice'],{ queryParams: { step: 0 } });
  }
}
