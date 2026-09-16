import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TngIcon } from '@tailng-ui/icons';

@Component({
  selector: 'app-docs',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TngIcon],
  templateUrl: './docs.html',
  styleUrl: './docs.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class Docs {}
