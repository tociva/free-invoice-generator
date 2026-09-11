import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';
import dayjs from 'dayjs';

@Injectable()
export class DayjsDateAdapter extends NativeDateAdapter {
  private dateFormat = 'DD-MM-YYYY';

  setFormat(format: string) {
    this.dateFormat = format;
  }

  override format(date: Date, displayFormat: object): string {
    return dayjs(date).format(this.dateFormat);
  }

  override parse(value: string | number | null | undefined): Date | null {
    const parsed = dayjs(value, this.dateFormat);
    return parsed.isValid() ? parsed.toDate() : null;
  }
}
