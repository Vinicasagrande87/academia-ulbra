import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"
import { AuthService } from '../../services/auth';
// ajuste o caminho conforme a pasta real onde o auth.ts está no seu projeto

@Component({
  selector: 'app-professores-lista',
  templateUrl: './professores-lista.page.html',
  styleUrls: ['./professores-lista.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class ProfessoresListaPage implements OnInit {

  professores: any[] = [];
  voltarPara: string = '/home-professor';

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController,
    private authService: AuthService,
    private ngZone: NgZone
    // necessário pro toast aparecer de forma confiável — ver comentário
    // detalhado em login.page.ts sobre o motivo
  ) {}

  ngOnInit() {
    this.carregarProfessores();
  }

  ionViewWillEnter() {
    // recalcula toda vez que a página fica visível — o Ionic pode reaproveitar
    // esta instância entre navegações (IonicRouteStrategy), então isso evita
    // que o valor fique "preso" de um login anterior na mesma aba
    const usuario = this.authService.getUser();
    this.voltarPara = usuario?.tipo === 'admin' ? '/home-admin' : '/home-professor';
  }

  carregarProfessores() {
    this.http.get(`${environment.apiUrl}/professores`).subscribe({
      next: (res: any) => { this.professores = res; },
      error: (err) => console.error('Erro ao carregar professores:', err)
    });
  }

  async editarProfessor(professor: any) {
    const alert = await this.alertController.create({
      header: 'Editar professor',
      inputs: [
        { name: 'nome', type: 'text', value: professor.nome, placeholder: 'Nome' },
        { name: 'email', type: 'email', value: professor.email, placeholder: 'E-mail' },
        { name: 'cref', type: 'text', value: professor.cref, placeholder: 'CREF' },
        { name: 'especialidade', type: 'text', value: professor.especialidade, placeholder: 'Especialidade' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: (dados) => this.salvarEdicao(professor.id, dados)
        }
      ]
    });

    await alert.present();
  }

  private salvarEdicao(id: number, dados: any) {
    this.http.put(`${environment.apiUrl}/professores/${id}`, dados).subscribe({
      next: () => {
        this.ngZone.run(async () => {
          const toast = await this.toastController.create({
            message: 'Professor atualizado com sucesso!',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
          this.carregarProfessores();
        });
      },
      error: (err) => {
        console.error('Erro ao atualizar professor:', err);
        this.ngZone.run(async () => {
          const toast = await this.toastController.create({
            message: err.error?.error || 'Erro ao atualizar professor.',
            duration: 2500,
            color: 'danger'
          });
          await toast.present();
        });
      }
    });
  }

  async excluirProfessor(professor: any) {
    const alert = await this.alertController.create({
      header: 'Excluir professor',
      message: `Tem certeza que deseja excluir ${professor.nome}? Essa ação não pode ser desfeita.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => this.confirmarExclusao(professor)
        }
      ]
    });

    await alert.present();
  }

  private confirmarExclusao(professor: any) {
    this.http.delete(`${environment.apiUrl}/professores/${professor.id}`).subscribe({
      next: () => {
        this.professores = this.professores.filter(p => p.id !== professor.id);
        this.ngZone.run(async () => {
          const toast = await this.toastController.create({
            message: 'Professor excluído com sucesso!',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        });
      },
      error: (err) => {
        console.error('Erro ao excluir professor:', err);
        this.ngZone.run(async () => {
          const toast = await this.toastController.create({
            message: err.error?.error || 'Erro ao excluir professor.',
            duration: 2500,
            color: 'danger'
          });
          await toast.present();
        });
      }
    });
  }
}