import { TestBed } from '@angular/core/testing';

import { MessageOfTheDayService } from './message-of-the-day.service';

describe('MessageOfTheDayService', () => {
  let service: MessageOfTheDayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageOfTheDayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
