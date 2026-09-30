import { Directive, ElementRef, HostListener, Input, OnChanges } from '@angular/core';

@Directive({
  selector: 'img[appImageFallback]',
  standalone: false
})
export class ImageFallbackDirective implements OnChanges {
  @Input() appImageFallback = 'assets/images/shield-placeholder.svg';
  @Input() src = '';

  private failed = false;

  constructor(private element: ElementRef<HTMLImageElement>) {}

  ngOnChanges() {
    this.failed = false;
    const image = this.element.nativeElement;
    if (!this.src) {
      this.showFallback();
      return;
    }
    image.src = this.src;
  }

  @HostListener('error') onError() {
    this.showFallback();
  }

  private showFallback() {
    if (this.failed) return;
    this.failed = true;
    this.element.nativeElement.src = this.appImageFallback;
  }
}
