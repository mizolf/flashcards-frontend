import { HttpInterceptorFn } from '@angular/common/http';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const csrfToken = getCsrfTokenFromCookie();
  
  const clonedRequest = req.clone({
    withCredentials: true,
    setHeaders: csrfToken ? {
      'X-XSRF-TOKEN': csrfToken
    } : {}
  });

  return next(clonedRequest);
};

function getCsrfTokenFromCookie(): string {
  const name = 'XSRF-TOKEN=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name)) {
      return cookie.substring(name.length);
    }
  }
  return '';
}
