import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-docs-overview',
  imports: [RouterLink],
  templateUrl: './docs-overview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsOverview {}
