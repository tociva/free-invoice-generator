import { Template, TemplateItem } from "./template.model";

export interface TemplateState {
  templates: Template[];
  templateItems: TemplateItem[];
  isLoaded: boolean;
  error: string | null;
  searchTags: string[];
  selectedTemplatePath: string | null;
  loadingTemplateHtml: boolean;
}
export const initialTemplateState : TemplateState ={
    templates:[],
    templateItems:[],
    isLoaded :false,
    error:null,
    searchTags:[],
    selectedTemplatePath :'invoice-templates/blue/royal-blue/blue-invoice-cgst-sgst.html',
    loadingTemplateHtml :false
}
//tags 

// export interface TagState {
//     tags: string[];
//     selectedTags: string[];
//     error: string | null;
//   }
  
//   export const initialTagState: TagState = {
//     tags: [],
//     selectedTags: [],
//     error: null
//   };
  