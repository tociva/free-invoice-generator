import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Template } from '../store/model/template.model';
import { Store } from '@ngrx/store';
import { TemplateState } from '../store/state/template.state';
import { loadTemplates } from '../store/actions/template.actions';
import { selectAllTemplates } from '../store/selectors/template.selector';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TemplatesComponent {

  private store = inject<Store<TemplateState>>(Store);
  
  templates: Template[] = [];


  ngOnInit() {
    this.store.dispatch(loadTemplates());
    this.store.select(selectAllTemplates).subscribe((templates) => {
      this.templates = templates;
    });
  }
}
