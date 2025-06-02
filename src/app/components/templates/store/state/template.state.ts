import { SafeHtml } from "@angular/platform-browser";
import { Template, TemplateItem } from "../model/template.model";

export interface TemplateState {
  templates: Template[];
  templateItems: TemplateItem[];
  error: string | null;
  // Pagination
  currentPage: number;
  pageSize: number;
  totalCount: number;
}

export const initialTemplateState: TemplateState = {
  templates: [],
  templateItems: [],
  error: null,
  currentPage: 0,
  pageSize: 10,
  totalCount: 0
};
