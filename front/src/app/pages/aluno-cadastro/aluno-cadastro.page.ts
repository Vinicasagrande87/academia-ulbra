import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"
import { AuthService } from '../../services/auth';
// ajuste o caminho conforme a pasta real onde o auth.ts está no seu projeto

@Component({
  selector: 'app-aluno-cadastro',
  templateUrl: './aluno-cadastro.page.html',
  styleUrls: ['./aluno-cadastro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class AlunoCadastroPage {

  aluno = {
    nome: '',
    idade: null as number | null,
    peso: null as number | null,
    altura: null as number | null,
    cpf: '',
    telefone: '',
    email: '',
    senha: '',
    finalidade: ''
  };

  voltarPara: string = '/home-professor';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ionViewWillEnter() {
    const usuario = this.authService.getUser();
    this.voltarPara = usuario?.tipo === 'admin' ? '/home-admin' : '/home-professor';
  }

  cadastrarAluno() {
    this.http.post(`${environment.apiUrl}/alunos`, this.aluno).subscribe({
      next: () => {
        // window.location.href é um comando puro do navegador — não passa
        // por Angular Router, Zone.js, ToastController ou nenhuma outra
        // camada do framework. É o jeito mais direto e garantido de sair
        // desta tela depois do cadastro. Recarrega a página de destino,
        // mas isso não é problema nenhum aqui.
        window.location.href = this.voltarPara;
      },
      error: (err) => {
        console.error('Erro ao cadastrar aluno:', err);
        window.alert(err.error?.error || 'Erro ao cadastrar aluno.');
      }
    });
  }
}