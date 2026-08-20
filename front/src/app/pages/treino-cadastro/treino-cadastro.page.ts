import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"
import { ExercicioMidiaComponent } from '../../components/exercicio-midia/exercicio-midia.component';
// ajuste o caminho conforme onde o componente ficou salvo

@Component({
  selector: 'app-treino-cadastro',
  templateUrl: './treino-cadastro.page.html',
  styleUrls: ['./treino-cadastro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ExercicioMidiaComponent]
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
    private route: ActivatedRoute
  ) {}

  ionViewWillEnter() {
    this.alunoId = this.route.snapshot.paramMap.get('alunoId');
    this.carregarExercicios();
    if (this.itens.length === 0) {
      this.adicionarItem();
    }
  }

  carregarExercicios() {
    this.http.get(`${environment.apiUrl}/exercicios`).subscribe({
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

  // busca o exercício completo já cadastrado (com video_url e workoutx_id)
  // do item escolhido nesse card — não precisa o professor colar/escolher
  // nada além do nome, vem tudo junto automaticamente
  exercicioCompletoDoItem(item: { exercicio_id: number | null }) {
    if (!item.exercicio_id) return null;
    return this.exercicios.find(ex => ex.id === item.exercicio_id) || null;
  }

  adicionarItem() {
    this.itens.push({ grupo: '', exercicio_id: null, carga: '', repeticoes: '' });
  }

  removerItem(index: number) {
    this.itens.splice(index, 1);
  }

  podeSalvar(): boolean {
    if (!this.diaSemana) return false;
    if (this.itens.length === 0) return false;

    return this.itens.every(item =>
      !!item.grupo &&
      !!item.exercicio_id &&
      !!item.carga?.trim() &&
      !!item.repeticoes?.trim()
    );
  }

  salvarTreino() {
    if (!this.podeSalvar()) {
      return;
    }

    const treino = {
      aluno_id: Number(this.alunoId),
      dia_semana: this.diaSemana,
      exercicios: this.itens.map((item, i) => ({
        exercicio_id: item.exercicio_id,
        carga: item.carga ? parseInt(String(item.carga).replace(/\D/g, ''), 10) : null,
        repeticoes: item.repeticoes,
        ordem: i + 1
      }))
    };

    this.http.post(`${environment.apiUrl}/treinos`, treino).subscribe({
      next: () => {
        window.location.href = `/aluno-ficha/${this.alunoId}`;
      },
      error: (err) => {
        console.error('Erro ao salvar treino:', err);
        window.alert(err.error?.error || 'Erro ao montar treino.');
      }
    });
  }
}