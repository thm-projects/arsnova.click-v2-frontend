import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StorageKey } from '../../../lib/enums/enums';
import { UserService } from '../../user/user.service';

@Injectable({
    providedIn: 'root'
})
export class BonusTokenService {
    constructor(private http: HttpClient, private userService: UserService) {
    }

    public getBonusToken(): Observable<string> {
        return this.http.get<string>(`${environment.apiUrl}/member/token/bonus`, {
            headers: {authorization: sessionStorage.getItem(StorageKey.QuizToken)},
        });
    }
}
