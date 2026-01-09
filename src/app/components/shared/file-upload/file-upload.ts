import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FileSelect } from './file-select';

@Component({
  selector: 'app-file-upload',
  imports: [FileSelect],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUpload {
  fileUploadAccept = input<string>('');
  deskTopView = input<string>('');
  mobileView = input<string>('');
  fileChanged = output<File>();

  onFileInput(files: File) {
    this.fileChanged.emit(files);
  }

}
