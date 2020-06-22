import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { QuizEntity } from '../../../lib/entities/QuizEntity';
import { StorageKey } from '../../../lib/enums/enums';
import { IMessage } from '../../../lib/interfaces/communication/IMessage';
import { IAnswerResult } from '../../../lib/interfaces/IAnswerResult';

@Injectable({
  providedIn: 'root',
})
export class QuizApiService {
  private _getFreeMemberGroupUrl: string;
  private _getActiveQuizzesUrl: string;
  private _getCanUseBonusTokenUrl: string;
  private _getExportFileUrl: string;

  get getFreeMemberGroupUrl(): string {
    return this._getFreeMemberGroupUrl;
  }

  private _getDemoQuizUrl: string;

  get getDemoQuizUrl(): string {
    return this._getDemoQuizUrl;
  }

  private _getAbcdQuizUrl: string;

  get getAbcdQuizUrl(): string {
    return this._getAbcdQuizUrl;
  }

  private _deleteQuizUrl: string;

  get deleteQuizUrl(): string {
    return this._deleteQuizUrl;
  }

  set deleteQuizUrl(value: string) {
    this._deleteQuizUrl = value;
  }

  private _postQuizSettingsUpdateUrl: string;

  get postQuizSettingsUpdateUrl(): string {
    return this._postQuizSettingsUpdateUrl;
  }

  private _postQuizUploadUrl: string;

  get postQuizUploadUrl(): string {
    return this._postQuizUploadUrl;
  }

  private _getQuizStatusUrl: string;

  get getQuizStatusUrl(): string {
    return this._getQuizStatusUrl;
  }

  private _getFullQuizStatusDataUrl: string;
  private _initQuizInstanceUrl: string;
  private _getQuizUrl: string;
  private _setQuizAsPrivateUrl: string;
  private _getOwnPublicQuizzesUrl: string;
  private _getOwnPublicQuizAmountUrl: string;
  private _getPublicQuizAmountUrl: string;
  private _getPublicQuizzesUrl: string;
  private _putSaveQuizUrl: string;
  private _getQuizSettingsUrl: string;
  private _deleteActiveQuizUrl: string;
  private _putQuizUrl: string;
  private _postNextStepUrl: string;
  private _postResetQuizUrl: string;
  private _postStopQuizUrl: string;
  private _getQuizStartTimeUrl: string;
  private _getAnswerResultUrl: string;

  constructor(private http: HttpClient) {
    this.loadUrls();
  }

  public setQuiz(quiz: QuizEntity): Observable<QuizEntity> {
    if (!environment.readingConfirmationEnabled) {
      quiz.sessionConfig.readingConfirmationEnabled = false;
    }
    if (!environment.confidenceSliderEnabled) {
      quiz.sessionConfig.confidenceSliderEnabled = false;
    }

    return this.http.put<QuizEntity>(this._putQuizUrl, { quiz }, {
      headers: {
        authorization: sessionStorage.getItem(StorageKey.PrivateKey),
      },
    });
  }

  public nextStep(quizName: string): Observable<IMessage> {
    return this.http.post<IMessage>(`${this._postNextStepUrl}`, { quizName },
      { headers: { authorization: sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public deleteQuiz(quiz: QuizEntity | string): Observable<IMessage> {
    return this.http.delete<IMessage>(`${this._deleteQuizUrl}/${encodeURIComponent(typeof quiz === 'string' ? quiz : quiz.name)}`,
      { headers: { authorization: sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public resetQuiz(quiz: QuizEntity): Observable<IMessage> {
    return this.http.post<IMessage>(`${this._postResetQuizUrl}/${encodeURIComponent(quiz.name)}`, {},
      { headers: { authorization: sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public stopQuiz(quiz: QuizEntity): Observable<IMessage> {
    return this.http.post<IMessage>(`${this._postStopQuizUrl}`, { quizName: quiz.name },
      { headers: { authorization: sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public postQuizSettingsUpdate(quiz: QuizEntity, settings: object): Observable<IMessage> {
    return this.http.post<IMessage>(`${this._postQuizSettingsUpdateUrl}`, {
      quizName: quiz.name,
      settings,
    }, { headers: { authorization: sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public getQuizSettings(quizName: string): Observable<IMessage> {
    return this.http.get<IMessage>(`${this._getQuizSettingsUrl}/${encodeURIComponent(quizName)}`);
  }

  public postQuizUpload(formData: FormData): Observable<IMessage> {
    return this.http.post<IMessage>(`${this._postQuizUploadUrl}`, formData,
      { headers: { authorization: sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public getQuizStatus(quizName): Observable<IMessage> {
    return this.http.get<IMessage>(`${this._getQuizStatusUrl}/${encodeURIComponent(quizName ? quizName : '')}`,
      { headers: { authorization: sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public getFullQuizStatusData(quizName): Observable<IMessage> {
    return this.http.get<IMessage>(`${this._getFullQuizStatusDataUrl}/${encodeURIComponent(quizName ? quizName : '')}`,
      { headers: { authorization: sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public getQuiz(quizName: string): Observable<IMessage> {
    return this.http.get<IMessage>(`${this._getQuizUrl}/${encodeURIComponent(quizName)}`,
      { headers: { authorization: sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public getQuizStartTime(): Observable<number> {
    return this.http.get<number>(`${this._getQuizStartTimeUrl}`,
      { headers: { authorization: sessionStorage.getItem(StorageKey.QuizToken) || sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public getFreeMemberGroup(quizName: string): Observable<IMessage> {
    return this.http.get<IMessage>(`${this._getFreeMemberGroupUrl}/${encodeURIComponent(quizName)}`,
      { headers: { authorization: sessionStorage.getItem(StorageKey.QuizToken) || sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public generateABCDQuiz(language: string, length: number): Observable<QuizEntity> {
    return this.http.get<QuizEntity>(`${this._getAbcdQuizUrl}/${encodeURIComponent(language)}/${encodeURIComponent(length)}`);
  }

  public generateDemoQuiz(language: string): Observable<QuizEntity> {
    return this.http.get<QuizEntity>(`${this._getDemoQuizUrl}/${encodeURIComponent(language)}`);
  }

  public deleteActiveQuiz(quiz: QuizEntity): Observable<void> {
    return this.http.delete<void>(`${this._deleteActiveQuizUrl}/${encodeURIComponent(quiz.name)}`,
      { headers: { authorization: sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public putSavedQuiz(quizEntity: QuizEntity): Observable<IMessage> {
    return this.http.put<IMessage>(`${this._putSaveQuizUrl}`, { quiz: quizEntity },
      { headers: { authorization: sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public getPublicQuizzes(): Observable<Array<QuizEntity>> {
    return this.http.get<Array<QuizEntity>>(this._getPublicQuizzesUrl, { headers: { authorization: sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public getOwnPublicQuizzes(): Observable<Array<QuizEntity>> {
    return this.http.get<Array<QuizEntity>>(this._getOwnPublicQuizzesUrl,
      { headers: { authorization: sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public getPublicQuizAmount(): Observable<number> {
    return this.http.get<number>(this._getPublicQuizAmountUrl, { headers: { authorization: sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public getOwnPublicQuizAmount(): Observable<number> {
    return this.http.get<number>(this._getOwnPublicQuizAmountUrl, { headers: { authorization: sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public setQuizAsPrivate(quizEntity: QuizEntity): Observable<void> {
    return this.http.post<void>(this._setQuizAsPrivateUrl, { name: quizEntity.name },
      { headers: { authorization: sessionStorage.getItem(StorageKey.PrivateKey) } });
  }

  public initQuizInstance(name: string): Observable<IMessage> {
    return this.http.post<IMessage>(this._initQuizInstanceUrl, {
      name,
      readingConfirmationEnabled: environment.readingConfirmationEnabled,
      confidenceSliderEnabled: environment.confidenceSliderEnabled,
      theme: environment.forceQuizTheme ? environment.defaultTheme : null,
    }, {
      headers: {
        'X-Access-Token': sessionStorage.getItem(StorageKey.LoginToken),
        authorization: sessionStorage.getItem(StorageKey.PrivateKey),
      },
    });
  }

  public getActiveQuizzes(): Observable<Array<string>> {
    return this.http.get<Array<string>>(this._getActiveQuizzesUrl);
  }

  public getCanUseBonusToken(): Observable<boolean> {
    return this.http.get<boolean>(this._getCanUseBonusTokenUrl, { headers: { authorization: sessionStorage.getItem(StorageKey.QuizToken) } });
  }

  public getAnswerResult(): Observable<IAnswerResult> {
    return this.http.get<IAnswerResult>(this._getAnswerResultUrl,
      { headers: { authorization: sessionStorage.getItem(StorageKey.QuizToken) } },
    );
  }

  public getExportFile(quizName: string, theme: string, langCode: string): Observable<HttpEvent<ArrayBuffer>> {
    const encodedQuizname = encodeURIComponent(quizName);
    const encodedPrivateKey = encodeURIComponent(sessionStorage.getItem(StorageKey.PrivateKey));
    const encodedTheme = encodeURIComponent(theme);
    const encodedLang = encodeURIComponent(langCode);

    return this.http.get<ArrayBuffer>(`${this._getExportFileUrl}/${encodedQuizname}/${encodedPrivateKey}/${encodedTheme}/${encodedLang}`,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'arraybuffer' as 'json'
      },
    );
  }

  private loadUrls(): void {
    this._putQuizUrl = `${environment.apiUrl}/quiz`;
    this._putSaveQuizUrl = `${environment.apiUrl}/quiz/save`;
    this._postNextStepUrl = `${environment.apiUrl}/quiz/next`;
    this._deleteQuizUrl = `${environment.apiUrl}/quiz`;
    this._postResetQuizUrl = `${environment.apiUrl}/quiz/reset`;
    this._postStopQuizUrl = `${environment.apiUrl}/quiz/stop`;
    this._postQuizSettingsUpdateUrl = `${environment.apiUrl}/quiz/settings`;
    this._getQuizSettingsUrl = `${environment.apiUrl}/quiz/settings`;
    this._postQuizUploadUrl = `${environment.apiUrl}/quiz/upload`;
    this._getQuizUrl = `${environment.apiUrl}/quiz/quiz`;
    this._getQuizStatusUrl = `${environment.apiUrl}/quiz/status`;
    this._getFullQuizStatusDataUrl = `${environment.apiUrl}/quiz/full-status`;
    this._getQuizStartTimeUrl = `${environment.apiUrl}/quiz/start-time`;
    this._getFreeMemberGroupUrl = `${environment.apiUrl}/quiz/member-group`;
    this._getAbcdQuizUrl = `${environment.apiUrl}/quiz/generate/abcd`;
    this._getDemoQuizUrl = `${environment.apiUrl}/quiz/generate/demo`;
    this._setQuizAsPrivateUrl = `${environment.apiUrl}/quiz/private`;
    this._getPublicQuizzesUrl = `${environment.apiUrl}/quiz/public`;
    this._getPublicQuizAmountUrl = `${environment.apiUrl}/quiz/public/amount`;
    this._getOwnPublicQuizzesUrl = `${environment.apiUrl}/quiz/public/own`;
    this._getOwnPublicQuizAmountUrl = `${environment.apiUrl}/quiz/public/amount/own`;
    this._deleteActiveQuizUrl = `${environment.apiUrl}/quiz/active`;
    this._initQuizInstanceUrl = `${environment.apiUrl}/quiz/public/init`;
    this._getActiveQuizzesUrl = `${environment.apiUrl}/quiz/active`;
    this._getCanUseBonusTokenUrl = `${environment.apiUrl}/quiz/bonus-token`;
    this._getAnswerResultUrl = `${environment.apiUrl}/quiz/answer-result`;
    this._getExportFileUrl = `${environment.apiUrl}/quiz/export`;
  }
}
