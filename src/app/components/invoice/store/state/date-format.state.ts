import { DateFormat } from '../model/date-format.model';

export interface DateFormatState {
  dateFormats: DateFormat[];
  selectedDateFormat: DateFormat;
  error: string | null;
}

export const initialDateFormatState: DateFormatState = {
  dateFormats: [],
  selectedDateFormat: {
    name: '31-01-2022',
    value: 'DD-MM-YYYY'
  },
  error: null
};
