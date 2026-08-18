import { Component } from '@angular/core';
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
  selector: 'app-exercicio-cadastro',
  templateUrl: './exercicio-cadastro.page.html',
  styleUrls: ['./exercicio-cadastro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class ExercicioCadastroPage {

  gruposMusculares = ['Peito', 'Costas', 'Ombro', 'Braço', 'Abdômen', 'Glúteo', 'Pernas'];

  exercicio = {
    nome: '',
    grupo_muscular: '',
    video_url: '',
    equipamento: ''
  };

  voltarPara: string = '/home-professor';
  // o botão de voltar precisa saber se quem está aqui é admin ou professor,
  // já que os dois têm painéis (URLs) diferentes agora

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
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

  async cadastrarExercicio() {
    // o token é anexado automaticamente pelo authInterceptor
    this.http.post(`${environment.apiUrl}/exercicios`, this.exercicio).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Exercício cadastrado com sucesso!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.router.navigate([this.voltarPara]);
      },
      error: async (err) => {
        console.error('Erro ao cadastrar exercício:', err);
        const toast = await this.toastController.create({
          message: err.error?.error || 'Erro ao cadastrar exercício.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}