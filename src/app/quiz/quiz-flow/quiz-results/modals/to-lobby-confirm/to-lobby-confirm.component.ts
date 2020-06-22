import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../../environments/environment';
import { StorageKey } from '../../../../../lib/enums/enums';
import { QuizService } from '../../../../../service/quiz/quiz.service';
import { ThemesService } from '../../../../../service/themes/themes.service';

@Component({
  selector: 'app-to-lobby-confirm',
  templateUrl: './to-lobby-confirm.component.html',
  styleUrls: ['./to-lobby-confirm.component.scss'],
})
export class ToLobbyConfirmComponent {

  constructor(
    private activeModal: NgbActiveModal,
    private quizService: QuizService,
    private translateService: TranslateService,
    private themesService: ThemesService
  ) { }

  public confirm(): void {
    this.activeModal.close();
  }

  public abort(): void {
    this.activeModal.dismiss();
  }

  public export(): void {
      const link = `${environment.apiUrl}/quiz/export/${this.quizService.quiz.name}/${sessionStorage.getItem(
          StorageKey.PrivateKey)}/${this.themesService.currentTheme}/${this.translateService.currentLang}`;
      window.open(link);
  }
}
