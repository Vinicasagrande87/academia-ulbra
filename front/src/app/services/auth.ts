import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;
  // se for testar no celular físico, troque a URL dentro de environment.ts
  // pelo IP da sua máquina na rede

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // Função para fazer login
  login(credentials: { email: string; senha: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // Limpa os dados salvos e manda de volta pro login
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // Usado pelo authInterceptor pra anexar o token nas requisições
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Útil pra decidir o que mostrar/redirecionar sem esperar erro 401
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Recupera os dados do usuário logado (id, nome, tipo) salvos no login
  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}