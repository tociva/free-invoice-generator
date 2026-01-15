import { DateFormat } from './date-format.model';
import dayjs from 'dayjs'

export interface DateFormatState {
  dateFormat: DateFormat[];
  isLoading: boolean;
  error: string | null;
}

export const initialDateFormatState: DateFormatState = {
  dateFormat: [],
  isLoading: false,
  error: null,
};

export const DateFormatConvert = {
   toString(date: Date | string, format: string): string {
    return dayjs(date).format(format);
  }
  // toString(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  //   return dayjs(date).format(format);
  // }
//   const date = new Date('2026-01-08');
// console.log(DateFormatConvert.toString(date, 'YYYY-MM-DD')); 

}
