import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { EventEmitter, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DefaultSettings } from '../../../lib/default.settings';
import { AbstractQuestionEntity } from '../../../lib/entities/question/AbstractQuestionEntity';
import { QuizEntity } from '../../../lib/entities/QuizEntity';
import { DbTable } from '../../../lib/enums/enums';
import { StatusProtocol } from '../../../lib/enums/Message';
import { IFooterBarElement } from '../../../lib/footerbar-element/interfaces';
import { QuizApiService } from '../api/quiz/quiz-api.service';
import { FooterBarService } from '../footer-bar/footer-bar.service';
import { SettingsService } from '../settings/settings.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class QuizService {
  public readonly quizUpdateEmitter: EventEmitter<QuizEntity> = new EventEmitter(true);

  private _isOwner = false;

  get isOwner(): boolean {
    return this._isOwner;
  }

  set isOwner(value: boolean) {
    this._isOwner = value;
  }

  private _quiz: QuizEntity;

  get quiz(): QuizEntity {
    return this._quiz;
  }

  set quiz(value: QuizEntity) {
    if (value) {
      sessionStorage.setItem('currentQuizName', value.name);
    }
    this._quiz = value;
    this.quizUpdateEmitter.emit(value);
  }

  private _readingConfirmationRequested = false;

  get readingConfirmationRequested(): boolean {
    return this._readingConfirmationRequested;
  }

  set readingConfirmationRequested(value: boolean) {
    this._readingConfirmationRequested = value;
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private translateService: TranslateService,
    private footerBarService: FooterBarService,
    private storageService: StorageService,
    private settingsService: SettingsService,
    private quizApiService: QuizApiService,
  ) {
  }

  public cleanUp(): void {
    this._readingConfirmationRequested = false;

    if (isPlatformBrowser(this.platformId)) {
      this.close();
      this.quiz = null;
      this.isOwner = false;
    }
  }

  public persist(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.storageService.create(DbTable.Quiz, this.quiz.name, this.quiz).subscribe();
    }
  }

  public updateFooterElementsState(): void {
    if (this.quiz) {
      this.footerBarService.footerElemEnableCasLogin.isActive = this.quiz.sessionConfig.nicks.restrictToCasLogin;
      this.footerBarService.footerElemBlockRudeNicknames.isActive = this.quiz.sessionConfig.nicks.blockIllegalNicks;

      this.footerBarService.footerElemEnableCasLogin.onClickCallback = () => {
        const newState = !this.footerBarService.footerElemEnableCasLogin.isActive;
        this.footerBarService.footerElemEnableCasLogin.isActive = newState;
        this.quiz.sessionConfig.nicks.restrictToCasLogin = newState;
        this.persist();
      };
      this.footerBarService.footerElemBlockRudeNicknames.onClickCallback = () => {
        const newState = !this.footerBarService.footerElemBlockRudeNicknames.isActive;
        this.footerBarService.footerElemBlockRudeNicknames.isActive = newState;
        this.quiz.sessionConfig.nicks.blockIllegalNicks = newState;
        this.persist();
      };
    }
  }

  public currentQuestion(): AbstractQuestionEntity {
    if (!this.quiz) {
      return;
    }

    return this.quiz.questionList[this.quiz.currentQuestionIndex];
  }

  public close(): void {
    if (isPlatformServer(this.platformId)) {
      return null;
    }

    if (this.isOwner && this._quiz) {
      this.quizApiService.deleteActiveQuiz(this._quiz).subscribe();
    }
  }

  public toggleSetting(elem: IFooterBarElement): void {
    let target: string = null;
    switch (elem) {
      case this.footerBarService.footerElemResponseProgress:
        target = 'showResponseProgress';
        break;
      case this.footerBarService.footerElemConfidenceSlider:
        target = 'confidenceSliderEnabled';
        break;
      case this.footerBarService.footerElemReadingConfirmation:
        target = 'readingConfirmationEnabled';
        break;
    }
    if (target) {
      this._quiz.sessionConfig[target] = !elem.isActive;
      elem.isActive = !elem.isActive;
      this.toggleSettingByName(target, elem.isActive);
    }
  }

  public toggleSettingByName(target: string, state: boolean | string): void {
    this.quizApiService.postQuizSettingsUpdate({
      target: target,
      state: state,
    }).subscribe(data => {
      if (data.status !== StatusProtocol.Success) {
        console.log(data);
      }
    }, error => {
      console.log(error);
    });
  }

  public isValid(): boolean {
    return this.quiz && this.quiz.isValid();
  }

  public getVisibleQuestions(maxIndex?: number): Array<AbstractQuestionEntity> {
    if (!this._quiz) {
      return [];
    }
    return this._quiz.questionList.slice(0, maxIndex || this.quiz.currentQuestionIndex + 1);
  }

  public hasSelectedNick(nickname: string): boolean {
    return this.quiz.sessionConfig.nicks.selectedNicks.indexOf(nickname) !== -1;
  }

  public toggleSelectedNick(nickname: string): void {
    if (this.hasSelectedNick(nickname)) {
      this.removeSelectedNickByName(nickname);
    } else {
      this.addSelectedNick(nickname);
    }
  }

  public addSelectedNick(newSelectedNick: string): void {
    if (this.hasSelectedNick(newSelectedNick)) {
      return;
    }
    this.quiz.sessionConfig.nicks.selectedNicks.push(newSelectedNick);
  }

  public removeSelectedNickByName(selectedNick: string): void {
    const index = this.quiz.sessionConfig.nicks.selectedNicks.indexOf(selectedNick);
    if (index === -1) {
      return;
    }
    this.quiz.sessionConfig.nicks.selectedNicks.splice(index, 1);
  }

  public restoreSettings(quizName: string): void {
    this.quizApiService.getQuizStatus(quizName).subscribe(response => {
      this.quiz = response.payload.quiz;
      this.isOwner = false;
    });
  }

  public loadDataToPlay(quizName: string): void {
    this.storageService.read(DbTable.Quiz, quizName).subscribe(quiz => {
      if (!quiz) {
        this.restoreSettings(quizName);
        return;
      }

      this.quizApiService.getQuizStatus(quizName).subscribe(response => {
        if (!response.payload.quiz) {
          throw new Error(`No valid quiz found in quizStatus: ${JSON.stringify(response)}`);
        }

        this.quiz = response.payload.quiz;
        this.isOwner = true;
        this.updateOwnerState();
      });
    });
  }

  public loadDataToEdit(quizName: string): void {
    this.storageService.read(DbTable.Quiz, quizName).subscribe(quiz => {
      if (!quiz) {
        return;
      }

      this.quiz = new QuizEntity(quiz);
      this.isOwner = true;
      this.updateOwnerState();
    });
  }

  private updateOwnerState(): void {
    if (!this._isOwner || !this.quiz) {
      return;
    }

    this.footerBarService.footerElemReadingConfirmation.isActive = !!this.quiz.sessionConfig.readingConfirmationEnabled;
    this.footerBarService.footerElemResponseProgress.isActive = !!this.quiz.sessionConfig.showResponseProgress;
    this.footerBarService.footerElemConfidenceSlider.isActive = !!this.quiz.sessionConfig.confidenceSliderEnabled;

    if (isPlatformBrowser(this.platformId)) {
      this.footerBarService.footerElemExport.onClickCallback = async () => {
        const link = `${DefaultSettings.httpApiEndpoint}/quiz/export/${this._quiz.name}/${localStorage.getItem(
          'privateKey')}/${this._quiz.sessionConfig.theme}/${this.translateService.currentLang}`;
        window.open(link);
      };
    }

    this.updateFooterElementsState();
  }
}
