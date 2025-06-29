import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CloudDataService } from './services/cloud-data.service';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule,],
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
}
