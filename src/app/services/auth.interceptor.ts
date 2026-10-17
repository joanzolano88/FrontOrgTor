import { HttpErrorResponse, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!request.url.startsWith(environment.url)) return next.handle(request);
    if (request.url.endsWith('/usuario/login') || request.url.endsWith('/usuario')) return next.handle(request);
    const token = localStorage.getItem('token')?.trim();
    const tokenValue = token?.replace(/^Bearer\s+/i, '');
    const authorizedRequest = tokenValue
      ? request.clone({ setHeaders: { Authorization: `Bearer ${tokenValue}` } })
      : request;

    return next.handle(authorizedRequest).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.cerrarSesionExpirada();
        }
        return throwError(() => error);
      })
    );
  }

  private cerrarSesionExpirada() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    localStorage.removeItem('tipo');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('tipo');
    if (!this.router.url.startsWith('/auth/login')) {
      void this.router.navigateByUrl('/auth/login');
    }
  }
}
