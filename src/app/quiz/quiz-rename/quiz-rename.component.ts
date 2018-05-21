import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IDuplicateQuiz } from 'arsnova-click-v2-types/src/common';
import { IQuestionGroup } from 'arsnova-click-v2-types/src/questions/interfaces';
import { questionGroupReflection } from 'arsnova-click-v2-types/src/questions/questionGroup_reflection';
import { FileUploadService } from '../../service/file-upload/file-upload.service';
import { FooterBarService } from '../../service/footer-bar/footer-bar.service';

@Component({
  selector: 'app-quiz-rename',
  templateUrl: './quiz-rename.component.html',
  styleUrls: ['./quiz-rename.component.scss'],
})
export class QuizRenameComponent implements OnInit {
  public static TYPE = 'QuizRenameComponent';

  constructor(
    public fileUploadService: FileUploadService,
    private footerBarService: FooterBarService,
    private router: Router) {

    this.footerBarService.TYPE_REFERENCE = QuizRenameComponent.TYPE;
    this.footerBarService.replaceFooterElements([this.footerBarService.footerElemBack]);
  }

  public sendRecommendation(duplicateQuiz: IDuplicateQuiz, renameRecommendation: string): void {
    const reader = new FileReader();
    const file: File = <File>this.fileUploadService.renameFilesQueue.getAll('uploadFiles[]').filter((uploadedFile) => {
      return (<File>uploadedFile).name === duplicateQuiz.fileName;
    })[0];
    reader.addEventListener('load', () => {
      const jsonData = JSON.parse(reader.result);
      const quizData: IQuestionGroup = questionGroupReflection[jsonData.TYPE](jsonData);
      quizData.hashtag = renameRecommendation;
      const blob = new Blob([JSON.stringify(quizData.serialize())], { type: 'application/json' });
      this.fileUploadService.renameFilesQueue.set('uploadFiles[]', blob, duplicateQuiz.fileName);
      this.fileUploadService.uploadFile(this.fileUploadService.renameFilesQueue);
    });
    reader.readAsText(file);
  }

  public ngOnInit(): void {
    if (!this.fileUploadService.renameFilesQueue) {
      this.router.navigate(['/']);
    }
  }
}
