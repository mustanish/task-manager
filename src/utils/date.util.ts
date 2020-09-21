import * as moment from 'moment';
import { TimeStampFormat, TimeUnit } from '@groome/constants';

export function addTime(duration: number): string {
  return moment()
    .add(duration, TimeUnit)
    .format(TimeStampFormat);
}

export function timeNow(): string {
  return moment().format(TimeStampFormat);
}

export function timeDiff(
  dateTo: string | number,
  dateWith?: string | number,
): number {
  return moment(dateTo).diff(
    dateWith ? dateWith : moment().format(TimeStampFormat),
    'seconds',
  );
}
