import { Template, TemplateItem } from "./template.model";

export interface TemplateState {
  templates: Template[];
  templateItems: TemplateItem[];
  isLoaded: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  searchTags: string[];
  selectedTemplatePath: string | null;
}
export const initialTemplateState : TemplateState ={
    templates:[],
    templateItems:[],
    isLoaded :false,
    error:null,
    currentPage:0,
    pageSize :10,
    searchTags:[],
    selectedTemplatePath :'invoice-templates/blue/royal-blue/blue-invoice-cgst-sgst.html'
}