import { countries } from '../effects/country-list';
import { DateFormat } from '../model/date-format.model';


const uniqueDateFormats = Array.from(
  new Map(countries.map((c) => [c.dateFormat.name, c.dateFormat])).values()
);
export interface DateFormatState {
  dateFormats: DateFormat[];
  selectedDateFormat: DateFormat;
  error: string | null;
}

export const initialDateFormatState: DateFormatState = {
  dateFormats: uniqueDateFormats,
  selectedDateFormat: {
    name: '31-01-2022',
    value: 'DD-MM-YYYY'
  },
  error: null
};
