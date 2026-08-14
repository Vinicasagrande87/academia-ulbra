import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
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

  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private router: Router
  ) {}

  fazerLogin() {
    if (this.carregando) {
      return;
    }
    this.carregando = true;

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
      error: async (err) => {
        this.carregando = false;

        console.error('Erro ao fazer login:', err);
        const toast = await this.toastController.create({
          message: err.error?.error || 'E-mail ou senha inválidos.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}