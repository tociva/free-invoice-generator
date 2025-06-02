import { SafeHtml } from "@angular/platform-browser";

export interface TemplateItem {
  name: string;
  path: string;
}

export interface Template {
  theme: string;
  name: string;
  description: string;
  items: TemplateItem[];
}