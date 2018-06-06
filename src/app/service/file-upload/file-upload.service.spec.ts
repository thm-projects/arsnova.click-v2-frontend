import { HttpClient, HttpClientModule } from '@angular/common/http';
import { async, inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateCompiler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { createTranslateLoader } from '../../../lib/translation.factory';
import { ActiveQuestionGroupMockService } from '../active-question-group/active-question-group.mock.service';
import { ActiveQuestionGroupService } from '../active-question-group/active-question-group.service';
import { ConnectionMockService } from '../connection/connection.mock.service';
import { ConnectionService } from '../connection/connection.service';
import { CurrentQuizMockService } from '../current-quiz/current-quiz.mock.service';
import { CurrentQuizService } from '../current-quiz/current-quiz.service';
import { FooterBarService } from '../footer-bar/footer-bar.service';
import { SettingsService } from '../settings/settings.service';
import { SharedService } from '../shared/shared.service';
import { WebsocketMockService } from '../websocket/websocket.mock.service';
import { WebsocketService } from '../websocket/websocket.service';

import { FileUploadService } from './file-upload.service';

describe('FileUploadService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient],
          },
          compiler: {
            provide: TranslateCompiler,
            useClass: TranslateMessageFormatCompiler,
          },
        }),
      ],
      providers: [
        SharedService,
        { provide: WebsocketService, useClass: WebsocketMockService },
        { provide: ConnectionService, useClass: ConnectionMockService },
        SettingsService,
        TranslateService,
        { provide: CurrentQuizService, useClass: CurrentQuizMockService },
        FooterBarService,
        { provide: ActiveQuestionGroupService, useClass: ActiveQuestionGroupMockService },
        FileUploadService,
      ],
    });
  }));

  it('should be created', async(inject([FileUploadService], (service: FileUploadService) => {
    expect(service).toBeTruthy();
  })));
});