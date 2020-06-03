import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DefaultSettings} from '../../../lib/default.settings';
import {Observable} from 'rxjs';
import {IMessage} from '../../../lib/interfaces/communication/IMessage';
import {StorageKey} from '../../../lib/enums/enums';

@Injectable({
    providedIn: 'root',
})
export class HistogramApiService {
    constructor(private http: HttpClient) { }

    public HISTOGRAM_GET_DATA_URL(quizName: string, questionIndex: number): string {
        return `${DefaultSettings.httpApiEndpoint}/quiz/histogram/${encodeURIComponent(quizName)}/${encodeURIComponent(
            questionIndex)}`;
    }

    public getHistogramData(quizName: string, questionIndex: number): Observable<IMessage> {
        return this.http.get<IMessage>(
            this.HISTOGRAM_GET_DATA_URL(quizName, questionIndex),
            { headers: {
                authorization: sessionStorage.getItem(StorageKey.QuizToken) || sessionStorage.getItem(StorageKey.PrivateKey)
            } });
    }
}
