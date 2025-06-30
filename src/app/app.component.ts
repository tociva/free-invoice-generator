import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CloudDataService } from './services/cloud-data.service';
import { filter } from 'rxjs/operators';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true
})
export class AppComponent {

  constructor(private router: Router,
        private cloudDataService: CloudDataService

  ) {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        void this.cloudDataService.trackRouteChange(e.urlAfterRedirects);
      });
  }

  navigateToSpecificPage(path: string) {
    void this.router.navigate([path]);
  }

  // eslint-disable-next-line class-methods-use-this
  navigateToExternalPage(path: string) {
    window.location.href = path;
  }
}
