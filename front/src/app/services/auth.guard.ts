import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

// bloqueia o acesso a qualquer rota protegida se não houver login válido,
// e opcionalmente restringe por tipo de usuário via `data: { roles: [...] }`
// na definição da rota (ver app.routes.ts)
export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const roles = route.data?.['roles'] as string[] | undefined;

  if (roles && roles.length > 0) {
    const usuario = authService.getUser();

    if (!usuario || !roles.includes(usuario.tipo)) {
      router.navigate(['/login']);
      return false;
    }
  }

  return true;
};
