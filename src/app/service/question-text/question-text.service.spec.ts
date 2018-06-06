import { HttpClientModule } from '@angular/common/http';
import { async, inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { QuestionTextService } from './question-text.service';

describe('QuestionTextService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
      ],
      providers: [
        QuestionTextService,
      ],
    });
  }));

  it('should be created', async(inject([QuestionTextService], (service: QuestionTextService) => {
    expect(service).toBeTruthy();
  })));
});