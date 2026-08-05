import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonList, IonItem, IonInput, IonButton } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonList, IonItem, IonInput, IonButton]
})
export class LoginPage implements OnInit {
  email = '';
  senha = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() { }

  fazerLogin() {
    const credenciais = { email: this.email, senha: this.senha };

    this.authService.login(credenciais).subscribe({
      next: (resposta: any) => {
        console.log('Login bem-sucedido!', resposta);
        alert('Login realizado com sucesso!');
        // Aqui no futuro podemos redirecionar para a tela de treinos/home
      },
      error: (erro) => {
        console.error('Erro no login', erro);
        alert('E-mail ou senha inválidos!');
      }
    });
  }
}