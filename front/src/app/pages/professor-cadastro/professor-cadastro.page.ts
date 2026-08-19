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
  selector: 'app-professor-cadastro',
  templateUrl: './professor-cadastro.page.html',
  styleUrls: ['./professor-cadastro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class ProfessorCadastroPage {

  professor = {
    nome: '',
    email: '',
    senha: '',
    cref: '',
    especialidade: ''
  };

  voltarPara: string = '/home-professor';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ionViewWillEnter() {
    // recalcula toda vez que a página fica visível — o Ionic pode reaproveitar
    // esta instância entre navegações (IonicRouteStrategy), então isso evita
    // que o valor fique "preso" de um login anterior na mesma aba
    const usuario = this.authService.getUser();
    this.voltarPara = usuario?.tipo === 'admin' ? '/home-admin' : '/home-professor';
  }

  // checagem manual, direta nos valores do objeto — não depende do
  // professorForm.valid do Angular, que se mostrou pouco confiável
  // nesse ambiente de build
  podeSalvar(): boolean {
    const nomeOk = this.professor.nome.trim().length > 0;
    const emailOk = this.professor.email.trim().length > 0 && this.professor.email.includes('@');
    const senhaOk = this.professor.senha.length >= 6;
    return nomeOk && emailOk && senhaOk;
  }

  cadastrarProfessor() {
    if (!this.podeSalvar()) {
      return; // trava extra, além do [disabled] do botão
    }
    this.http.post(`${environment.apiUrl}/professores`, this.professor).subscribe({
      next: () => {
        // window.location.href em vez de router.navigate: garante que a
        // navegação aconteça de forma confiável após o cadastro, sem
        // depender de nenhuma outra camada do framework
        window.location.href = this.voltarPara;
      },
      error: (err) => {
        console.error('Erro ao cadastrar professor:', err);
        window.alert(err.error?.error || 'Erro ao cadastrar professor.');
      }
    });
  }
}