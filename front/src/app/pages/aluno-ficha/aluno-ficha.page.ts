import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"
import { calcularSituacaoPlano } from '../aluno-financeiro/aluno-financeiro.page';
// reaproveita a mesma lógica usada na tela financeira do aluno, agora
// aplicada aos pagamentos do aluno visto pelo professor/admin

@Component({
  selector: 'app-aluno-ficha',
  templateUrl: './aluno-ficha.page.html',
  styleUrls: ['./aluno-ficha.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class AlunoFichaPage implements OnInit {

  ordemDias = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  treinos: any[] = [];
  alunoId: string | null = null;
  nomeAluno: string | null = null;

  situacaoPlano: { mensagem: string, cor: string } | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.alunoId = this.route.snapshot.paramMap.get('id');
    const navigation = history.state;
    this.nomeAluno = navigation?.nome || null;

    this.carregarTreinos();
    this.carregarSituacaoPlano();
  }

  carregarTreinos() {
    // o token é anexado automaticamente pelo authInterceptor
    this.http.get(`${environment.apiUrl}/treinos?aluno_id=${this.alunoId}`).subscribe({
      next: (res: any) => {
        this.treinos = res.sort((a: any, b: any) =>
          this.ordemDias.indexOf(a.dia_semana) - this.ordemDias.indexOf(b.dia_semana)
        );
      },
      error: (err) => {
        console.error('Erro ao carregar treinos do aluno:', err);
      }
    });
  }

  carregarSituacaoPlano() {
    // busca os pagamentos desse aluno específico (admin/professor pode filtrar
    // por aluno_id) pra saber se o plano dele está em dia antes de liberar
    // o botão de montar treino novo
    this.http.get(`${environment.apiUrl}/pagamentos?aluno_id=${this.alunoId}`).subscribe({
      next: (res: any) => {
        this.situacaoPlano = calcularSituacaoPlano(res);
      },
      error: (err) => {
        console.error('Erro ao verificar situação do plano:', err);
      }
    });
  }

  planoBloqueado(): boolean {
    // bloqueia "montar treino novo" quando não há plano ativo (vencido ou
    // nunca teve nenhum pagamento confirmado) — o backend também checa isso,
    // então mesmo que alguém contorne o front, a criação é recusada
    return this.situacaoPlano?.cor === 'danger' || this.situacaoPlano?.cor === 'medium';
  }

  async excluirTreino(treino: any) {
    // pede confirmação antes de excluir — apagar remove o dia inteiro,
    // usado tanto pra corrigir um treino errado quanto pra tirar um dia
    // que o aluno não frequenta mais
    const alert = await this.alertController.create({
      header: 'Excluir treino',
      message: `Tem certeza que deseja excluir o treino de ${treino.dia_semana}? Essa ação não pode ser desfeita.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => this.confirmarExclusao(treino)
        }
      ]
    });

    await alert.present();
  }

  private confirmarExclusao(treino: any) {
    this.http.delete(`${environment.apiUrl}/treinos/${treino.id}`).subscribe({
      next: async () => {
        this.treinos = this.treinos.filter(t => t.id !== treino.id);
        const toast = await this.toastController.create({
          message: 'Treino excluído com sucesso!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
      },
      error: async (err) => {
        console.error('Erro ao excluir treino:', err);
        const toast = await this.toastController.create({
          message: err.error?.error || 'Erro ao excluir treino.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}