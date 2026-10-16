import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!request.url.startsWith(environment.url)) return next.handle(request);
    if (request.url.endsWith('/usuario/login') || request.url.endsWith('/usuario')) return next.handle(request);
    const token = localStorage.getItem('token');
    if (!token) return next.handle(request);
    return next.handle(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
}