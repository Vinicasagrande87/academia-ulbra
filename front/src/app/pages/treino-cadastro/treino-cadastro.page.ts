import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-treino-cadastro',
  templateUrl: './treino-cadastro.page.html',
  styleUrls: ['./treino-cadastro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class TreinoCadastroPage {

  diasDaSemana = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  gruposMusculares = ['Peito', 'Costas', 'Ombro', 'Braço', 'Abdômen', 'Glúteo', 'Pernas'];

  alunoId: string | null = null;
  diaSemana = '';
  exercicios: any[] = [];
  itens: { grupo: string, exercicio_id: number | null, carga: string | null, repeticoes: string | null }[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController
  ) {}

  // ionViewWillEnter executa toda vez que a página entra em foco/abre
  ionViewWillEnter() {
    this.alunoId = this.route.snapshot.paramMap.get('alunoId');
    this.carregarExercicios();
    if (this.itens.length === 0) {
      this.adicionarItem();
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  carregarExercicios() {
    this.http.get('http://localhost:3000/exercicios', { headers: this.getHeaders() }).subscribe({
      next: (res: any) => {
        this.exercicios = res;
      },
      error: (err) => {
        console.error('Erro ao carregar exercícios:', err);
      }
    });
  }

  exerciciosDoGrupo(grupo: string) {
    return this.exercicios.filter(ex => ex.grupo_muscular === grupo);
  }

  adicionarItem() {
    this.itens.push({ grupo: '', exercicio_id: null, carga: '', repeticoes: '' });
  }

  removerItem(index: number) {
    this.itens.splice(index, 1);
  }

  async salvarTreino() {
    const treino = {
      aluno_id: Number(this.alunoId),
      dia_semana: this.diaSemana,
      exercicios: this.itens.map((item, i) => ({
        exercicio_id: item.exercicio_id,
        carga: item.carga,
        repeticoes: item.repeticoes,
        ordem: i + 1
      }))
    };

    this.http.post('http://localhost:3000/treinos', treino, { headers: this.getHeaders() }).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Treino montado com sucesso!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.router.navigate(['/aluno-ficha', this.alunoId]);
      },
      error: async (err) => {
        console.error('Erro ao salvar treino:', err);
        const toast = await this.toastController.create({
          message: err.error?.error || 'Erro ao montar treino.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}