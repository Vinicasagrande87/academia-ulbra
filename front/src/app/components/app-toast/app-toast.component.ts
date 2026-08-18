import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification';

// componente montado UMA ÚNICA VEZ, direto no app.component.html (raiz de
// tudo) — sempre presente no DOM desde o início do app, então não depende
// de nenhum carregamento dinâmico/lazy como o overlay do Ionic. Qualquer
// página do site pode disparar uma mensagem aqui através do NotificationService.
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="notification.notificacao() as n"
      class="app-toast"
      [class.app-toast--success]="n.tipo === 'success'"
      [class.app-toast--danger]="n.tipo === 'danger'">
      {{ n.texto }}
    </div>
  `,
  styles: [`
    .app-toast {
      position: fixed;
      top: max(16px, env(safe-area-inset-top));
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      padding: 14px 22px;
      border-radius: 10px;
      color: white;
      font-weight: 600;
      font-size: 15px;
      max-width: min(90vw, 420px);
      text-align: center;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
      animation: app-toast-in 0.25s ease-out;
    }

    .app-toast--success {
      background: #2dd36f;
    }

    .app-toast--danger {
      background: #eb445a;
    }

    @keyframes app-toast-in {
      from {
        opacity: 0;
        transform: translate(-50%, -12px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
  `]
})
export class AppToastComponent {
  constructor(public notification: NotificationService) {}
}