import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LoginPage {

  credentials = {
    email: '',
    senha: ''
  };

  carregando = false;

  // mensagem exibida direto na tela, sem depender do ToastController do
  // Ionic (que está apresentando um bug de não renderizar nesse projeto/
  // ambiente de build — o overlay é criado mas nunca aparece visualmente,
  // sem lançar nenhum erro capturável). Essa abordagem usa só binding
  // normal do Angular, sem overlay nenhum, então é garantido que funciona.
  mensagem: { texto: string; tipo: 'success' | 'danger' } | null = null;
  private timeoutMensagem: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  private mostrarMensagem(texto: string, tipo: 'success' | 'danger') {
    clearTimeout(this.timeoutMensagem);
    this.mensagem = { texto, tipo };
    this.timeoutMensagem = setTimeout(() => {
      this.mensagem = null;
    }, 3000);
  }

  fazerLogin() {
    if (this.carregando) {
      return;
    }
    this.carregando = true;
    this.mensagem = null;

    this.authService.login(this.credentials).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify({ id: res.id, nome: res.nome, tipo: res.tipo }));

        const tipo = (res.tipo || '').toLowerCase();
        let destino = '/home-professor';

        if (tipo === 'aluno') {
          destino = '/home-aluno';
        } else if (tipo === 'admin') {
          destino = '/home-admin';
        }

        this.router.navigateByUrl(destino).then(() => {
          this.carregando = false;
        });
      },
      error: (err) => {
        this.carregando = false;
        console.error('Erro ao fazer login:', err);
        this.mostrarMensagem(err.error?.error || 'E-mail ou senha inválidos.', 'danger');
      }
    });
  }
}