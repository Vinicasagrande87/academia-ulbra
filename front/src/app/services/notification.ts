import { Injectable, signal } from '@angular/core';

export interface NotificacaoState {
  texto: string;
  tipo: 'success' | 'danger';
}

// serviço central de notificações — substitui o ToastController do Ionic,
// que apresentava um bug de não renderizar nesse projeto/ambiente de build
// (o overlay era criado internamente pelo Stencil mas nunca aparecia na
// tela, sem lançar nenhum erro capturável). Esse serviço usa só recursos
// nativos do Angular (signal), sem depender de nenhum carregamento dinâmico
// de componente — muito mais simples e confiável.
@Injectable({ providedIn: 'root' })
export class NotificationService {

  readonly notificacao = signal<NotificacaoState | null>(null);
  private timeoutId: any;

  mostrar(texto: string, tipo: 'success' | 'danger' = 'success', duracaoMs = 3000) {
    clearTimeout(this.timeoutId);
    this.notificacao.set({ texto, tipo });
    this.timeoutId = setTimeout(() => {
      this.notificacao.set(null);
    }, duracaoMs);
  }

  sucesso(texto: string, duracaoMs = 2000) {
    this.mostrar(texto, 'success', duracaoMs);
  }

  erro(texto: string, duracaoMs = 2500) {
    this.mostrar(texto, 'danger', duracaoMs);
  }
}