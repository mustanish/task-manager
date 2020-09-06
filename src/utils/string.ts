import { startCase, toLower, upperFirst } from 'lodash';

export function ucfirst(string): string {
  return startCase(toLower(string));
}

export function ucwords(string): string {
  return upperFirst(string);
}
