import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // roda antes de toda requisição HTTP feita pelo app; se tiver token salvo,
  // anexa o header Authorization automaticamente, sem cada página precisar
  // repetir esse código
  const token = localStorage.getItem('token');

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};