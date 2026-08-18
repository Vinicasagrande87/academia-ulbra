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
    private toastController: ToastController,
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone
    // necessário pro toast aparecer de forma confiável — ver comentário
    // detalhado em login.page.ts sobre o motivo
  ) {}

  ionViewWillEnter() {
    // recalcula toda vez que a página fica visível — o Ionic pode reaproveitar
    // esta instância entre navegações (IonicRouteStrategy), então isso evita
    // que o valor fique "preso" de um login anterior na mesma aba
    const usuario = this.authService.getUser();
    this.voltarPara = usuario?.tipo === 'admin' ? '/home-admin' : '/home-professor';
  }

  cadastrarProfessor() {
    this.http.post(`${environment.apiUrl}/professores`, this.professor).subscribe({
      next: () => {
        this.ngZone.run(async () => {
          const toast = await this.toastController.create({
            message: 'Professor cadastrado com sucesso!',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
          this.router.navigate(['/professores-lista']);
        });
      },
      error: (err) => {
        console.error('Erro ao cadastrar professor:', err);
        this.ngZone.run(async () => {
          const toast = await this.toastController.create({
            message: err.error?.error || 'Erro ao cadastrar professor.',
            duration: 2500,
            color: 'danger'
          });
          await toast.present();
        });
      }
    });
  }
}