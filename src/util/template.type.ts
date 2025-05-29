import { SafeHtml } from "@angular/platform-browser";

interface TemplateItem {
    name: string;
    path: string;
    html: SafeHtml;
}

export interface Template {
    theme: string;
    name: string;
    description: string;
    items: TemplateItem[];
}