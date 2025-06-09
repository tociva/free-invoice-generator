import { Template, TemplateItem } from '../model/template.model';

export interface TemplateState {
  templates: Template[];
  templateItems: TemplateItem[];
  error: string | null;
  currentPage: number;
  pageSize: number;
  searchTags: string[];
}

export const initialTemplateState: TemplateState = {
  templates: [],
  templateItems: [],
  error: null,
  currentPage: 0,
  pageSize: 3,
  searchTags: []
};
