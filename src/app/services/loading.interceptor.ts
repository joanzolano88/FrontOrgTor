import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoadingService } from './loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loading: LoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!request.url.startsWith(environment.url)) return next.handle(request);

    this.loading.requestStarted();
    return next.handle(request).pipe(finalize(() => this.loading.requestFinished()));
  }
}
