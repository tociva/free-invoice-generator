import { Template } from "../model/template.model";

export interface TemplateState {
  templates: Template[];
  error: string | null;
}

export const initialTemplateState: TemplateState = {
  templates: [],
  error: null
};
