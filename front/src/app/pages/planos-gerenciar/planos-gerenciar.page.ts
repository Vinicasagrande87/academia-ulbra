import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"
import { AuthService } from '../../services/auth';
// ajuste o caminho conforme a pasta real onde o auth.ts está no seu projeto

@Component({
  selector: 'app-planos-gerenciar',
  templateUrl: './planos-gerenciar.page.html',
  styleUrls: ['./planos-gerenciar.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class PlanosGerenciarPage implements OnInit {

  planos: any[] = [];
  voltarPara: string = '/home-professor';

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.carregarPlanos();
  }

  ionViewWillEnter() {
    // recalcula toda vez que a página fica visível — o Ionic pode reaproveitar
    // esta instância entre navegações (IonicRouteStrategy), então isso evita
    // que o valor fique "preso" de um login anterior na mesma aba
    const usuario = this.authService.getUser();
    this.voltarPara = usuario?.tipo === 'admin' ? '/home-admin' : '/home-professor';
  }

  carregarPlanos() {
    this.http.get(`${environment.apiUrl}/planos`).subscribe({
      next: (res: any) => { this.planos = res; },
      error: (err) => console.error('Erro ao carregar planos:', err)
    });
  }

  async abrirFormularioNovo() {
    const alert = await this.alertController.create({
      header: 'Novo plano',
      inputs: [
        { name: 'nome', type: 'text', placeholder: 'Nome do plano' },
        { name: 'descricao', type: 'text', placeholder: 'Descrição' },
        { name: 'valor', type: 'number', placeholder: 'Valor (ex: 99.90)' },
        { name: 'duracao_dias', type: 'number', placeholder: 'Duração em dias (ex: 30)' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Criar', handler: (dados) => this.criarPlano(dados) }
      ]
    });

    await alert.present();
  }

  private criarPlano(dados: any) {
    this.http.post(`${environment.apiUrl}/planos`, {
      nome: dados.nome,
      descricao: dados.descricao,
      valor: parseFloat(dados.valor),
      duracao_dias: parseInt(dados.duracao_dias, 10)
    }).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Plano criado com sucesso!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.carregarPlanos();
      },
      error: async (err) => {
        console.error('Erro ao criar plano:', err);
        const toast = await this.toastController.create({
          message: err.error?.error || 'Erro ao criar plano.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  async editarPlano(plano: any) {
    const alert = await this.alertController.create({
      header: 'Editar plano',
      inputs: [
        { name: 'nome', type: 'text', value: plano.nome, placeholder: 'Nome do plano' },
        { name: 'descricao', type: 'text', value: plano.descricao, placeholder: 'Descrição' },
        { name: 'valor', type: 'number', value: plano.valor, placeholder: 'Valor' },
        { name: 'duracao_dias', type: 'number', value: plano.duracao_dias, placeholder: 'Duração em dias' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Salvar', handler: (dados) => this.salvarEdicao(plano.id, dados) }
      ]
    });

    await alert.present();
  }

  private salvarEdicao(id: number, dados: any) {
    this.http.put(`${environment.apiUrl}/planos/${id}`, {
      nome: dados.nome,
      descricao: dados.descricao,
      valor: parseFloat(dados.valor),
      duracao_dias: parseInt(dados.duracao_dias, 10)
    }).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Plano atualizado com sucesso!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.carregarPlanos();
      },
      error: async (err) => {
        console.error('Erro ao atualizar plano:', err);
        const toast = await this.toastController.create({
          message: err.error?.error || 'Erro ao atualizar plano.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  async excluirPlano(plano: any) {
    const alert = await this.alertController.create({
      header: 'Excluir plano',
      message: `Tem certeza que deseja excluir o plano "${plano.nome}"? Isso pode falhar se já existirem pagamentos vinculados a ele.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => this.confirmarExclusao(plano)
        }
      ]
    });

    await alert.present();
  }

  private confirmarExclusao(plano: any) {
    this.http.delete(`${environment.apiUrl}/planos/${plano.id}`).subscribe({
      next: async () => {
        this.planos = this.planos.filter(p => p.id !== plano.id);
        const toast = await this.toastController.create({
          message: 'Plano excluído com sucesso!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
      },
      error: async (err) => {
        console.error('Erro ao excluir plano:', err);
        const toast = await this.toastController.create({
          message: err.error?.error || 'Erro ao excluir plano (provavelmente já tem pagamentos vinculados).',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}