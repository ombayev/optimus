import { TimelineFormSummaryComponent } from './timeline-form-summary/timeline-form-summary.component';
import { TimelineFormTitleComponent } from './timeline-form-title/timeline-form-title.component';
import { TimelineFormEventDateComponent } from './timeline-form-event-date/timeline-form-event-date.component';
import { TimelineFormEventTypeComponent } from './timeline-form-event-type/timeline-form-event-type.component';
import { TimelineFormLocationsComponent } from './timeline-form-locations/timeline-form-locations.component';
import { TimelineFormEventTypeV2Component } from './timeline-form-event-type-v2/timeline-form-event-type-v2.component';
import { TimelineFormIssueFollowupComponent } from './timeline-form-issue-followup/timeline-form-issue-followup.component';
// import { TimelineFormEventReportersComponent } from './timeline-form-event-reporters/timeline-form-event-reporters.component';

export const forms_controls: any[] = [
  TimelineFormTitleComponent,
  TimelineFormEventDateComponent,
  TimelineFormEventTypeComponent,
  TimelineFormEventTypeV2Component,
  TimelineFormSummaryComponent,
  TimelineFormLocationsComponent,
  TimelineFormIssueFollowupComponent
  // TimelineFormEventReportersComponent
];

export * from './timeline-form-title/timeline-form-title.component';
export * from './timeline-form-event-date/timeline-form-event-date.component';
export * from './timeline-form-event-type/timeline-form-event-type.component';
export * from './timeline-form-summary/timeline-form-summary.component';
export * from './timeline-form-locations/timeline-form-locations.component';
export * from './timeline-form-event-type-v2/timeline-form-event-type-v2.component';
export * from './timeline-form-issue-followup/timeline-form-issue-followup.component';
