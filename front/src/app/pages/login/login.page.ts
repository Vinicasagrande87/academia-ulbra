import { Component, NgZone } from '@angular/core';
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
    private router: Router,
    private ngZone: NgZone
    // NgZone é necessário aqui por causa de um problema conhecido do builder
    // esbuild do Angular: código async/await dentro do callback de erro de
    // um subscribe() às vezes roda fora da "zone" do Angular, então o toast
    // é criado no DOM mas a tela não é avisada pra mostrar ele. Envolvendo
    // com ngZone.run() garantimos que o Angular saiba da mudança e renderize.
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
      error: (err) => {
        this.carregando = false;
        console.error('Erro ao fazer login:', err);

        // roda a criação/exibição do toast explicitamente dentro da zone
        // do Angular, garantindo que a tela seja atualizada
        this.ngZone.run(async () => {
          const toast = await this.toastController.create({
            message: err.error?.error || 'E-mail ou senha inválidos.',
            duration: 2500,
            color: 'danger'
          });
          await toast.present();
        });
      }
    });
  }
}