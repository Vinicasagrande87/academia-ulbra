import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonSearchbar,
  IonContent, IonList, IonItem, IonLabel, IonButton
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { searchOutline, searchSharp, closeCircle, closeSharp } from 'ionicons/icons';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"
import { AuthService } from '../../services/auth';
// ajuste o caminho conforme a pasta real onde o auth.ts está no seu projeto

@Component({
  selector: 'app-alunos-lista',
  templateUrl: './alunos-lista.page.html',
  styleUrls: ['./alunos-lista.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonSearchbar,
    IonContent, IonList, IonItem, IonLabel, IonButton
  ]
})
export class AlunosListaPage implements OnInit {

  alunos: any[] = [];
  filtro = '';

  planos: any[] = [];
  // carregado uma vez, usado no alerta de vincular plano

  formasPagamento = [
    { valor: 'cartao_credito', label: 'Cartão de Crédito' },
    { valor: 'cartao_debito', label: 'Cartão de Débito' },
    { valor: 'pix', label: 'Pix' },
    { valor: 'dinheiro', label: 'Dinheiro' }
  ];

  voltarPara: string = '/home-professor';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      'search-outline': searchOutline,
      'search-sharp': searchSharp,
      'close-circle': closeCircle,
      'close-sharp': closeSharp
    });
  }

  ngOnInit() {
    this.carregarAlunos();
    this.carregarPlanos();
  }

  ionViewWillEnter() {
    const usuario = this.authService.getUser();
    this.voltarPara = usuario?.tipo === 'admin' ? '/home-admin' : '/home-professor';
  }

  carregarAlunos() {
    this.http.get(`${environment.apiUrl}/alunos`).subscribe({
      next: (res: any) => {
        this.alunos = res;
      },
      error: (err) => {
        console.error('Erro ao carregar alunos:', err);
      }
    });
  }

  carregarPlanos() {
    this.http.get(`${environment.apiUrl}/planos`).subscribe({
      next: (res: any) => { this.planos = res; },
      error: (err) => console.error('Erro ao carregar planos:', err)
    });
  }

  alunosFiltrados() {
    const termo = this.filtro.trim().toLowerCase();

    if (!termo) {
      return this.alunos;
    }

    return this.alunos.filter(aluno =>
      aluno.nome.toLowerCase().includes(termo)
    );
  }

  // passo 1: escolher qual plano o aluno pagou (só rádio, isolado)
  async vincularPlano(aluno: any, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    // preventDefault bloqueia a navegação nativa do link (routerLink do
    // ion-item); stopPropagation sozinho não bastava porque o Ionic
    // renderiza o item clicável como uma tag <a>

    if (this.planos.length === 0) {
      const toast = await this.toastController.create({
        message: 'Nenhum plano cadastrado ainda. Cadastre um plano primeiro em "Gerenciar Planos".',
        duration: 3000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const alert = await this.alertController.create({
      header: `Vincular plano — ${aluno.nome}`,
      inputs: this.planos.map((plano, index) => ({
        name: 'plano',
        type: 'radio' as const,
        label: `${plano.nome} — R$ ${plano.valor} (${plano.duracao_dias} dias)`,
        value: plano.id,
        checked: index === 0
      })),
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Próximo',
          handler: (planoId) => this.escolherFormaPagamento(aluno, planoId)
        }
      ]
    });

    await alert.present();
  }

  // passo 2: escolher a forma de pagamento (só rádio, isolado)
  private async escolherFormaPagamento(aluno: any, planoId: number) {
    const alert = await this.alertController.create({
      header: 'Forma de pagamento',
      inputs: this.formasPagamento.map((forma, index) => ({
        name: 'forma_pagamento',
        type: 'radio' as const,
        label: forma.label,
        value: forma.valor,
        checked: index === 0
      })),
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Próximo',
          handler: (formaPagamento) => this.confirmarValor(aluno, planoId, formaPagamento)
        }
      ]
    });

    await alert.present();
  }

  // passo 3: confirmar valor (editável, ex: desconto) e observação — só texto/número, isolado
  private async confirmarValor(aluno: any, planoId: number, formaPagamento: string) {
    const plano = this.planos.find(p => p.id === planoId);
    if (!plano) return;

    const alert = await this.alertController.create({
      header: 'Confirmar valor pago',
      inputs: [
        {
          name: 'valor',
          type: 'number',
          value: plano.valor,
          placeholder: 'Valor pago'
        },
        {
          name: 'observacao',
          type: 'text',
          placeholder: 'Observação (opcional)'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar pagamento',
          handler: (dados) => this.registrarPagamento(aluno, planoId, formaPagamento, dados)
        }
      ]
    });

    await alert.present();
  }

  private registrarPagamento(aluno: any, planoId: number, formaPagamento: string, dados: any) {
    const valor = parseFloat(dados.valor);

    if (isNaN(valor) || valor <= 0) {
      this.toastController.create({
        message: 'Informe um valor válido para o pagamento.',
        duration: 2500,
        color: 'danger'
      }).then(toast => toast.present());
      return;
    }

    this.http.post(`${environment.apiUrl}/pagamentos`, {
      aluno_id: aluno.id,
      plano_id: planoId,
      valor,
      forma_pagamento: formaPagamento,
      observacao: dados.observacao
    }).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: `Plano vinculado a ${aluno.nome} com sucesso! Já pode montar o treino.`,
          duration: 2500,
          color: 'success'
        });
        await toast.present();
      },
      error: async (err) => {
        console.error('Erro ao registrar pagamento:', err);
        const toast = await this.toastController.create({
          message: err.error?.error || 'Erro ao vincular plano.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}