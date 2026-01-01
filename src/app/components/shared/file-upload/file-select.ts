import { Directive, effect, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';

@Directive({
  selector: '[appFileSelect]',
  standalone: true,
  host: {
  '[class.bg-gray-500]': 'isDragOver()',
    '[class.animate-border-run]': 'isDragOver()',
    '[style.cursor]': '"pointer"',
},
})
export class FileSelect {

  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private fileInput = document.createElement('input');

  accept = input<string | undefined>(undefined, { alias: 'fileUploadAccept' });
  disabled = input(false, { alias: 'fileUploadDisabled' });
  files = output<File[]>({ alias: 'fileUploadFiles' });

  isDragOver = signal(false);


  constructor() {
    this.fileInput.type = 'file';
    this.fileInput.hidden = true;

    this.fileInput.addEventListener('change', () => {
      if (this.fileInput.files?.length) {
        this.files.emit(Array.from(this.fileInput.files));
        this.fileInput.value = '';
      }
    });

    this.host.nativeElement.appendChild(this.fileInput);

    effect(() => {
      this.fileInput.accept = this.accept() ?? '';
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
    this.isDragOver.set(true)
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

    if (!this.disabled() && event.dataTransfer?.files?.length) {
  const validFiles = Array.from(event.dataTransfer.files).filter(f => this.isValidFile(f));
  this.files.emit(validFiles);
}

  }

  private isValidFile(file : File) : boolean{
    const isJson = file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');
    const isImage = file.type.startsWith('image/');
    return isJson || isImage;
  }
}
