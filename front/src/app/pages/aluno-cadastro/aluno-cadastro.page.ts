import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
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

  // mensagem exibida direto na tela, sem depender do ToastController do
  // Ionic — ver explicação detalhada em login.page.ts
  mensagem: { texto: string; tipo: 'success' | 'danger' } | null = null;
  private timeoutMensagem: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ionViewWillEnter() {
    // recalcula toda vez que a página fica visível — o Ionic pode reaproveitar
    // esta instância entre navegações (IonicRouteStrategy), então isso evita
    // que o valor fique "preso" de um login anterior na mesma aba
    const usuario = this.authService.getUser();
    this.voltarPara = usuario?.tipo === 'admin' ? '/home-admin' : '/home-professor';
  }

  private mostrarMensagem(texto: string, tipo: 'success' | 'danger') {
    clearTimeout(this.timeoutMensagem);
    this.mensagem = { texto, tipo };
    this.timeoutMensagem = setTimeout(() => {
      this.mensagem = null;
    }, 2500);
  }

  cadastrarAluno() {
    // o token é anexado automaticamente pelo authInterceptor
    this.mensagem = null;
    this.http.post(`${environment.apiUrl}/alunos`, this.aluno).subscribe({
      next: () => {
        this.mostrarMensagem('Aluno cadastrado com sucesso!', 'success');
        // aguarda um instante pra pessoa ver a mensagem antes de navegar
        setTimeout(() => {
          this.router.navigate([this.voltarPara]);
        }, 1200);
      },
      error: (err) => {
        console.error('Erro ao cadastrar aluno:', err);
        this.mostrarMensagem(err.error?.error || 'Erro ao cadastrar aluno.', 'danger');
      }
    });
  }
}