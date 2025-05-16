export interface Currency {
    name: string;
    html: string;
    unicode: string;
    decimal: number;
  }
  
  export interface DateFormat {
    name: string;
    value: string;
  }
  
  export interface Country {
    name: string;
    code: string;
    iso: string;
    currency: Currency;
    dateformat: DateFormat;
  }
  