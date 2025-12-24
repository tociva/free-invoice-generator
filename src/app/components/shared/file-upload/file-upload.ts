import { Component } from '@angular/core';
import { FileSelect } from './file-select'

@Component({
  selector: 'app-file-upload',
  imports: [FileSelect],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.css',
})
export class FileUpload {

selectedFiles: File[] = [];
isDragOver = false;

  onFiles(files: File[]) {
    this.selectedFiles = files;
    console.log('Files:', files);
  }

}
