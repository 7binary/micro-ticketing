import { Publisher, Subjects } from '@azticketing/common';
import { ExpirationCompleteEvent } from '@azticketing/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
