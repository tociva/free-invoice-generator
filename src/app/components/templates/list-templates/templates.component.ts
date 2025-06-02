import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Template } from '../../../../util/template.type';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TemplatesComponent {

  templates: Template[] = [];


  ngOnInit() {
    
  }

  async convertTemplateToHtml(path: string) {
    // const template = await firstValueFrom(this.templateService.fetchTemplate(path));
    // console.log(template);
    // return template;
    return 'sdfsd';
  }
}
