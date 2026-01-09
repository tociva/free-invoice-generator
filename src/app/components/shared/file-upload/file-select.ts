import {
  Directive,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';

@Directive({
  selector: '[appFileSelect]',
  standalone: true,
  host: {
    '[class.bg-gray-500]': 'isDragOver()',
    '[class.animate-border-run]': 'isDragOver()',
    '[style.cursor]': '"pointer"',
  },
})
export class FileSelect implements OnInit {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private fileInput = document.createElement('input');

  accept = input<string | undefined>(undefined, { alias: 'fileUploadAccept' });
  disabled = input(false, { alias: 'fileUploadDisabled' });
  files = output<File>({ alias: 'fileUploadFiles' });
  error = output<string>({ alias: 'fileUploadError' });
  isDragOver = signal(false);

 ngOnInit(): void {
    this.fileInput.type = 'file';
    this.fileInput.hidden = true;
    this.host.nativeElement.appendChild(this.fileInput);

    this.fileInput.addEventListener('change', () => {
      const file = this.fileInput.files?.[0];
      if (file) {
        this.handleFile(file);
      }
      this.fileInput.value = '';
    });
  }


  @HostListener('click')
  onFileInput() {
    if (!this.disabled()) {
      this.fileInput.click();
    }
  }
  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);

    if (this.disabled() || !event.dataTransfer?.files?.length) return;

    const file = event.dataTransfer.files[0];
    this.handleFile(file);
  }

  private handleFile(file: File) {
    if (this.isValidFile(file)) {
      this.files.emit(file);
    } else {
      this.error.emit(`Invalid file type: ${file.name}`);
    }
  }

  private isValidFile(file: File): boolean {
    const isJson =
      file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');
    const isImage = file.type.startsWith('image/');
    return isJson || isImage;
  }
}