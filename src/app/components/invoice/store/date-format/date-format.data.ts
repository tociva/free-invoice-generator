import { DateFormat } from '../date-format/date-format.model';

export const dateFormats: DateFormat[] = [
  { name: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { name: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { name: 'DD-MM-YYYY', value: 'DD-MM-YYYY' },
  { name: 'DD.MM.YYYY', value: 'DD.MM.YYYY' },
  { name: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
  { name: 'YYYY.MM.DD', value: 'YYYY.MM.DD' },
  { name: 'YYYY/MM/DD', value: 'YYYY/MM/DD' },

  { name: 'DD/MM/YY', value: 'DD/MM/YY' },
  { name: 'MM/DD/YY', value: 'MM/DD/YY' },
  { name: 'YY/MM/DD', value: 'YY/MM/DD' },
  { name: 'YY-MM-DD', value: 'YY-MM-DD' },

  { name: 'DD-MMM-YYYY', value: 'DD-MMM-YYYY' },
  { name: 'DD-MMMM-YYYY', value: 'DD-MMMM-YYYY' },
  { name: 'MMM-DD-YYYY', value: 'MMM-DD-YYYY' },
  { name: 'MMMM-DD-YYYY', value: 'MMMM-DD-YYYY' },
  { name: 'YYYY-MMM-DD', value: 'YYYY-MMM-DD' },
  { name: 'YYYY-MMMM-DD', value: 'YYYY-MMMM-DD' },

  { name: 'DD MMM YYYY', value: 'DD MMM YYYY5' },
  { name: 'DD MMMM YYYY', value: 'DD MMMM YYYY' },
  { name: 'MMM DD, YYYY', value: 'MMM DD, YYYY' },
  { name: 'MMMM DD, YYYY', value: 'MMMM DD, YYYY' },
  { name: 'YYYY MMM DD', value: 'YYYY MMM DD' },
  { name: 'YYYY MMMM DD', value: 'YYYY MMMM DD' },

  { name: 'Do MMM YYYY', value: 'Do MMM YYYY' },
  { name: 'Do MMMM YYYY', value: 'Do MMMM YYYY' },

  { name: 'YYYYMMDD', value: 'YYYYMMDD' },
];
