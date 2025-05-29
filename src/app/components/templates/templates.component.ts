import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TemplateService } from '../../services/template.service';
import { Template } from '../../../util/template.type';
import { SafeUrlPipe } from '../common/pipes/safe-url.pipe';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TemplatesComponent {

  templates: Template[] = [];

  constructor(private templateService: TemplateService) {}

  ngOnInit() {
    this.templateService.fetchAllTemplates().subscribe(templates => {
      this.templates = templates;
    });
  }

  async convertTemplateToHtml(path: string) {
    // const template = await firstValueFrom(this.templateService.fetchTemplate(path));
    // console.log(template);
    // return template;
    return 'sdfsd';
  }
}
