import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';

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

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router
  ) {
    addIcons({
      'log-out-outline': logOutOutline
    });
  }

  async fazerLogin() {
    this.http.post('http://localhost:3000/login', this.credentials).subscribe({
      next: async (res: any) => {
        console.log('RESPOSTA COMPLETA DO LOGIN:', res); // Olhe o F12 (Console) para ver o que o backend retorna

        // Salva o token e dados do usuário no localStorage
        localStorage.setItem('token', res.token);
        
        // Pega o usuário de onde quer que ele venha na resposta
        const usuario = res.usuario || res.user || res.dados || res;
        localStorage.setItem('user', JSON.stringify(usuario));

        const toast = await this.toastController.create({
          message: 'Login realizado com sucesso!',
          duration: 1500,
          color: 'success'
        });
        await toast.present();

        // Extrai propriedades possíveis de tipo/perfil/cargo
        const tipo = (usuario.tipo || usuario.perfil || usuario.role || '').toLowerCase();
        const email = (usuario.email || this.credentials.email || '').toLowerCase();

        // Se for explicitamente ALUNO, manda para a área do aluno. Caso contrário, painel do professor/admin.
        if (tipo === 'aluno' || email === 'maria@email.com') {
          this.router.navigate(['/home-aluno']);
        } else {
          this.router.navigate(['/home-professor']);
        }
      },
      error: async (err) => {
        console.error(err);
        const toast = await this.toastController.create({
          message: err.error?.error || 'E-mail ou senha inválidos.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.credentials.email = '';
    this.credentials.senha = '';
  }
}