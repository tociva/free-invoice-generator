import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-templates',
  standalone: true,
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ]
})
export class TemplatesComponent {
  templates = [
    { id: 'templateA', name: 'Professional Blue Style' },
    { id: 'templateB', name: 'Minimal Red Border' },
    { id: 'templateC', name: 'Classic Corporate Format' }
  ];

  constructor(private location: Location) {}

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.location.href = '/';
    }
  }

  useTemplate(templateId: string) {
    console.log(`Selected template: ${templateId}`);
    // Navigate or set state based on selected template
  }
}
