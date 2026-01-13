export interface Currency {
  code: string;
  name: string;
  symbol: string;
  numericcode: number;
  minorunit: number | null;
  fraction?: string;
}