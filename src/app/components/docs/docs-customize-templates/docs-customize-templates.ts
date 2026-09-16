import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TngCodeBlockComponent } from '@tailng-ui/components';

@Component({
  selector: 'app-docs-customize-templates',
  imports: [TngCodeBlockComponent],
  templateUrl: './docs-customize-templates.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsCustomizeTemplates {
  readonly placeholderExample = '<p>Invoice Number: [[invoice_number]]</p>';
  readonly renderedExample = '<p>Invoice Number: INV-001</p>';
  readonly itemTableExample = `<table>
  <thead>
    <tr>
      <th>Item</th>
      <th>Quantity</th>
      <th>Price</th>
      <th>CGST</th>
      <th>SGST</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    [[items_start]]
    <tr>
      <td>[[item_name]]</td>
      <td>[[item_quantity]]</td>
      <td>[[item_price]]</td>
      <td>[[item_cgst]]</td>
      <td>[[item_sgst]]</td>
      <td>[[item_amount]]</td>
    </tr>
    [[items_end]]
  </tbody>
</table>`;
}

