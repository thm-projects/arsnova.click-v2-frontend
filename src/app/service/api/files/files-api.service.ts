import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AudioPlayerConfigTarget } from '../../../lib/enums/AudioPlayerConfigTarget';

@Injectable({
  providedIn: 'root',
})
export class FilesApiService {

  constructor() { }

  public SOUND_FILE_GET_URL(target: AudioPlayerConfigTarget, fileName: string): string {
    return `${environment.apiUrl}/files/sound/${encodeURIComponent(target)}/${encodeURIComponent(fileName)}.mp3`;
  }
}
