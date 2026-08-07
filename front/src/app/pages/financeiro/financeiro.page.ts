import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"
import { AuthService } from '../../services/auth';
// ajuste o caminho conforme a pasta real onde o auth.ts está no seu projeto

@Component({
  selector: 'app-financeiro',
  templateUrl: './financeiro.page.html',
  styleUrls: ['./financeiro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class FinanceiroPage implements OnInit {

  planos: any[] = [];
  pagamentos: any[] = [];
  filtroStatus = 'pendente';

  voltarPara: string;
  // o botão de voltar precisa saber se quem está aqui é admin ou professor,
  // já que os dois têm painéis (URLs) diferentes agora

  formasPagamento = [
    { valor: 'cartao_credito', label: 'Cartão de Crédito' },
    { valor: 'cartao_debito', label: 'Cartão de Débito' },
    { valor: 'pix', label: 'Pix' },
    { valor: 'dinheiro', label: 'Dinheiro' }
  ];

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController,
    private authService: AuthService
  ) {
    const usuario = this.authService.getUser();
    this.voltarPara = usuario?.tipo === 'admin' ? '/home-admin' : '/home-professor';
  }

  ngOnInit() {
    this.carregarPlanos();
    this.carregarPagamentos();
  }

  carregarPlanos() {
    this.http.get(`${environment.apiUrl}/planos`).subscribe({
      next: (res: any) => { this.planos = res; },
      error: (err) => console.error('Erro ao carregar planos:', err)
    });
  }

  carregarPagamentos() {
    const query = this.filtroStatus ? `?status=${this.filtroStatus}` : '';
    this.http.get(`${environment.apiUrl}/pagamentos${query}`).subscribe({
      next: (res: any) => { this.pagamentos = res; },
      error: (err) => console.error('Erro ao carregar pagamentos:', err)
    });
  }

  formaPagamentoLabel(valor: string): string {
    const forma = this.formasPagamento.find(f => f.valor === valor);
    return forma ? forma.label : valor;
  }

  async confirmarPagamento(pagamento: any) {
    // pede uma observação opcional antes de confirmar (ex: "pago em 3x na
    // maquininha"); a data de confirmação vai automaticamente como hoje
    const alert = await this.alertController.create({
      header: 'Confirmar pagamento',
      message: `Confirmar pagamento de ${pagamento.aluno_nome} — R$ ${pagamento.valor} via ${this.formaPagamentoLabel(pagamento.forma_pagamento)}?`,
      inputs: [
        {
          name: 'observacao',
          type: 'text',
          placeholder: 'Observação (opcional)'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: (data) => this.enviarConfirmacao(pagamento, data.observacao)
        }
      ]
    });

    await alert.present();
  }

  private enviarConfirmacao(pagamento: any, observacao: string) {
    this.http.put(`${environment.apiUrl}/pagamentos/${pagamento.id}`, {
      status: 'confirmado',
      valor: pagamento.valor,
      forma_pagamento: pagamento.forma_pagamento,
      observacao
    }).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Pagamento confirmado!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.carregarPagamentos();
      },
      error: async (err) => {
        console.error('Erro ao confirmar pagamento:', err);
        const toast = await this.toastController.create({
          message: err.error?.error || 'Erro ao confirmar pagamento.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}