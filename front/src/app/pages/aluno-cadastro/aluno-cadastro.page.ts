import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
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

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone
    // necessário pro toast aparecer de forma confiável — ver comentário
    // detalhado em login.page.ts sobre o motivo (bug do builder esbuild
    // com async/await dentro do callback de subscribe)
  ) {}

  ionViewWillEnter() {
    // recalcula toda vez que a página fica visível — o Ionic pode reaproveitar
    // esta instância entre navegações (IonicRouteStrategy), então isso evita
    // que o valor fique "preso" de um login anterior na mesma aba
    const usuario = this.authService.getUser();
    this.voltarPara = usuario?.tipo === 'admin' ? '/home-admin' : '/home-professor';
  }

  cadastrarAluno() {
    // o token é anexado automaticamente pelo authInterceptor
    this.http.post(`${environment.apiUrl}/alunos`, this.aluno).subscribe({
      next: () => {
        this.ngZone.run(async () => {
          const toast = await this.toastController.create({
            message: 'Aluno cadastrado com sucesso!',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
          // volta pro menu principal (home-admin ou home-professor, conforme
          // quem está logado) em vez de ir pra lista de alunos
          this.router.navigate([this.voltarPara]);
        });
      },
      error: (err) => {
        console.error('Erro ao cadastrar aluno:', err);
        this.ngZone.run(async () => {
          const toast = await this.toastController.create({
            message: err.error?.error || 'Erro ao cadastrar aluno.',
            duration: 2500,
            color: 'danger'
          });
          await toast.present();
        });
      }
    });
  }
}