import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"

@Component({
  selector: 'app-aluno-financeiro',
  templateUrl: './aluno-financeiro.page.html',
  styleUrls: ['./aluno-financeiro.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class AlunoFinanceiroPage implements OnInit {

  planos: any[] = [];
  pagamentos: any[] = [];
  situacaoPlano: { mensagem: string, cor: string } | null = null;

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
    private ngZone: NgZone
    // necessário pro toast aparecer de forma confiável — ver comentário
    // detalhado em login.page.ts sobre o motivo
  ) {}

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
    this.http.get(`${environment.apiUrl}/pagamentos`).subscribe({
      next: (res: any) => {
        this.pagamentos = res;
        this.situacaoPlano = calcularSituacaoPlano(this.pagamentos);
      },
      error: (err) => console.error('Erro ao carregar pagamentos:', err)
    });
  }

  formaPagamentoLabel(valor: string): string {
    const forma = this.formasPagamento.find(f => f.valor === valor);
    return forma ? forma.label : valor;
  }

  async escolherPlano(plano: any) {
    // pede pro aluno escolher a forma de pagamento antes de registrar a
    // intenção; o pagamento em si (maquininha, pix) acontece fora do app —
    // isso aqui só sinaliza pro staff confirmar depois
    const alert = await this.alertController.create({
      header: `Plano ${plano.nome}`,
      message: `Valor: R$ ${plano.valor}. Como você vai pagar?`,
      inputs: this.formasPagamento.map(forma => ({
        type: 'radio',
        label: forma.label,
        value: forma.valor
      })),
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar escolha',
          handler: (formaPagamento) => this.enviarSolicitacao(plano, formaPagamento)
        }
      ]
    });

    await alert.present();
  }

  private enviarSolicitacao(plano: any, formaPagamento: string) {
    if (!formaPagamento) {
      return;
    }

    this.http.post(`${environment.apiUrl}/pagamentos`, {
      plano_id: plano.id,
      forma_pagamento: formaPagamento
    }).subscribe({
      next: () => {
        this.ngZone.run(async () => {
          const toast = await this.toastController.create({
            message: 'Solicitação enviada! Aguarde a confirmação na recepção.',
            duration: 3000,
            color: 'success'
          });
          await toast.present();
          this.carregarPagamentos();
        });
      },
      error: (err) => {
        console.error('Erro ao enviar solicitação:', err);
        this.ngZone.run(async () => {
          const toast = await this.toastController.create({
            message: err.error?.error || 'Erro ao enviar solicitação.',
            duration: 2500,
            color: 'danger'
          });
          await toast.present();
        });
      }
    });
  }
}

// exportada pra poder ser reaproveitada em home-aluno.page.ts, já que a
// home também precisa mostrar o aviso de renovação
export function calcularSituacaoPlano(pagamentos: any[]): { mensagem: string, cor: string } | null {
  const confirmados = pagamentos
    .filter(p => p.status === 'confirmado' && p.valido_ate)
    .sort((a, b) => new Date(b.valido_ate).getTime() - new Date(a.valido_ate).getTime());

  if (confirmados.length === 0) {
    return {
      mensagem: 'Você ainda não tem um plano ativo. Escolha um plano abaixo pra começar!',
      cor: 'medium'
    };
  }

  const planoAtual = confirmados[0];
  const hoje = new Date();
  const validoAte = new Date(planoAtual.valido_ate);
  const diasRestantes = Math.ceil((validoAte.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  const dataFormatada = validoAte.toLocaleDateString('pt-BR');

  if (diasRestantes < 0) {
    return {
      mensagem: `Seu plano venceu em ${dataFormatada}. Renove abaixo pra continuar treinando!`,
      cor: 'danger'
    };
  }

  if (diasRestantes <= 7) {
    return {
      mensagem: `Seu plano vence em ${diasRestantes} dia${diasRestantes === 1 ? '' : 's'} (${dataFormatada}). Que tal já renovar?`,
      cor: 'warning'
    };
  }

  return {
    mensagem: `Seu plano está ativo até ${dataFormatada}.`,
    cor: 'success'
  };
}