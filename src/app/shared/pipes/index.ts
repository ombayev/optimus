import { LocationsFilterPipe } from './locations-filter.pipe';
import { AppsFilterPipe } from './apps-filter.pipe';
import { ApplicableEventTypesPipe } from './applicable-event-types.pipe';
import { SelectLocationsPipe } from './select-locations.pipe';

export const pipes: any[] = [
  AppsFilterPipe,
  SelectLocationsPipe,
  ApplicableEventTypesPipe,
  LocationsFilterPipe
];

export * from './apps-filter.pipe';
export * from './applicable-event-types.pipe';
export * from './select-locations.pipe';
export * from './locations-filter.pipe';
