import { Template, TemplateItem } from '../model/template.model';

export interface TemplateState {
  templates: Template[];
  templateItems: TemplateItem[];
  loaded: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  searchTags: string[];
  selectedTemplatePath: string | null;
}

export const initialTemplateState: TemplateState = {
  templates: [],
  templateItems: [],
  loaded: false,
  error: null,
  currentPage: 0,
  pageSize: 3,
  searchTags: [],
  selectedTemplatePath: 'invoice-templates/blue/royal-blue/blue-invoice-cgst-sgst.html'
};
