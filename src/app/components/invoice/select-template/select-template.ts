import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Template {
  id: string;
  name: string;
  preview: string;
  isSelected: boolean;
}

@Component({
  selector: 'app-select-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-template.html',
  styleUrls: ['./select-template.css'],
})
export class SelectTemplateComponent implements OnInit {
  templates: Template[] = [
    {
      id: '1',
      name: 'Classic',
      preview: '📄 Classic Template',
      isSelected: true,
    },
    {
      id: '2',
      name: 'Modern',
      preview: '📄 Modern Template',
      isSelected: false,
    },
    {
      id: '3',
      name: 'Minimal',
      preview: '📄 Minimal Template',
      isSelected: false,
    },
    {
      id: '4',
      name: 'Professional',
      preview: '📄 Professional Template',
      isSelected: false,
    },
  ];

  ngOnInit(): void {}

  selectTemplate(id: string): void {
    this.templates.forEach((template) => {
      template.isSelected = template.id === id;
    });
  }
}
