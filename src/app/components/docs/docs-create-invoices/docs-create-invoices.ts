import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TngButtonComponent } from '@tailng-ui/components';
import { TngIcon } from '@tailng-ui/icons';

@Component({
  selector: 'app-docs-create-invoices',
  imports: [RouterLink, TngButtonComponent, TngIcon],
  templateUrl: './docs-create-invoices.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsCreateInvoices {}
