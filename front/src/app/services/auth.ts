import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL do seu back-end rodando na máquina
  private apiUrl = 'http://localhost:3000'; // Se for testar no celular físico depois, troque pelo IP da sua rede

  constructor(private http: HttpClient) { }

  // Função para fazer login
  login(credentials: { email: string; senha: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
}