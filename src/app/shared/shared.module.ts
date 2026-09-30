import { NgModule } from '@angular/core';
import { ImageFallbackDirective } from './directives/image-fallback.directive';

@NgModule({
  declarations: [ImageFallbackDirective],
  exports: [ImageFallbackDirective]
})
export class SharedModule {}
