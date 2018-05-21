import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { MarkdownModule } from '../../markdown/markdown.module';
import { CasService } from '../../service/cas/cas.service';
import { SharedModule } from '../../shared/shared.module';
import { ThemesModule } from '../../themes/themes.module';
import { ConfidenceRateComponent } from './confidence-rate/confidence-rate.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { QuizLobbyComponent } from './quiz-lobby/quiz-lobby.component';
import { QuestionDetailsComponent } from './quiz-results/question-details/question-details.component';
import { QuizResultsComponent } from './quiz-results/quiz-results.component';
import { QuizResultsModule } from './quiz-results/quiz-results.module';
import { QuizThemeComponent } from './quiz-theme/quiz-theme.component';
import { ReadingConfirmationComponent } from './reading-confirmation/reading-confirmation.component';
import { VotingComponent } from './voting/voting.component';

export const quizFlowRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'lobby',
  },
  {
    path: 'lobby',
    canLoad: [CasService],
    component: QuizLobbyComponent,
    data: {},
  },
  {
    path: 'results',
    component: QuizResultsComponent,
    data: {},
  },
  {
    path: 'results/:questionIndex',
    component: QuestionDetailsComponent,
    data: {},
  },
  {
    path: 'theme',
    component: QuizThemeComponent,
    data: {},
  },
  {
    path: 'leaderboard',
    component: LeaderboardComponent,
    data: {},
  },
  {
    path: 'leaderboard/:questionIndex',
    component: LeaderboardComponent,
    data: {},
  },
  {
    path: 'voting',
    component: VotingComponent,
    data: {},
  },
  {
    path: 'reading-confirmation',
    component: ReadingConfirmationComponent,
    data: {},
  },
  {
    path: 'confidence-rate',
    component: ConfidenceRateComponent,
    data: {},
  },
];

@NgModule({
  imports: [
    MarkdownModule,
    SharedModule,
    ThemesModule,
    RouterModule.forChild(quizFlowRoutes),
    QuizResultsModule,
    NgxQRCodeModule,
  ],
  declarations: [
    QuizLobbyComponent,
    VotingComponent,
    LeaderboardComponent,
    QuizThemeComponent,
    ReadingConfirmationComponent,
    ConfidenceRateComponent,
  ],
})
export class QuizFlowModule {
}
