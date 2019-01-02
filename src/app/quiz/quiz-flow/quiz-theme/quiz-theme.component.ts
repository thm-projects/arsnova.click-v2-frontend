import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { FooterBarService } from '../../../service/footer-bar/footer-bar.service';
import { QuizService } from '../../../service/quiz/quiz.service';
import { ThemesService } from '../../../service/themes/themes.service';

@Component({
  selector: 'app-quiz-theme',
  templateUrl: './quiz-theme.component.html',
  styleUrls: ['./quiz-theme.component.scss'],
})
export class QuizThemeComponent implements OnDestroy {
  public static TYPE = 'QuizThemeComponent';

  private previewThemeBackup: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private footerBarService: FooterBarService,
    private quizService: QuizService,
    private themesService: ThemesService,
  ) {

    this.footerBarService.TYPE_REFERENCE = QuizThemeComponent.TYPE;
    footerBarService.replaceFooterElements([
      this.footerBarService.footerElemBack,
    ]);
    if (isPlatformBrowser(this.platformId)) {
      this.previewThemeBackup = document.getElementsByTagName('html').item(0).dataset['theme'];
    }
  }

  public ngOnDestroy(): void {
    this.themesService.updateCurrentlyUsedTheme();
  }

  public updateTheme(id: string): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    document.getElementsByTagName('html').item(0).dataset['theme'] = id;
    this.previewThemeBackup = document.getElementsByTagName('html').item(0).dataset['theme'];
    this.quizService.quiz.sessionConfig.theme = id;

    this.quizService.toggleSettingByName('theme', id);
  }

  public previewTheme(id): void {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementsByTagName('html').item(0).dataset['theme'] = id;
    }
  }

  public restoreTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      const themeDataset = document.getElementsByTagName('html').item(0).dataset['theme'];

      if (themeDataset === this.previewThemeBackup) {
        return;
      }

      document.getElementsByTagName('html').item(0).dataset['theme'] = this.previewThemeBackup;
    }

    this.themesService.reloadLinkNodes(this.previewThemeBackup);
  }

}
