import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth';
import { YoutubeEmbedComponent } from '../../components/youtube-embed/youtube-embed.component';

interface Exercicio {
  id: number;
  nome: string;
  grupo_muscular: string;
  video_url: string;
  equipamento: string;
}

@Component({
  selector: 'app-exercicio-cadastro',
  templateUrl: './exercicio-cadastro.page.html',
  styleUrls: ['./exercicio-cadastro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, YoutubeEmbedComponent]
})
export class ExercicioCadastroPage {

  gruposMusculares = ['Peito', 'Costas', 'Ombro', 'Braço', 'Abdômen', 'Glúteo', 'Pernas'];
  todosExercicios: Exercicio[] = [];
  grupoSelecionado = '';
  readonly OPCAO_NOVO = '__novo__';
  exercicioSelecionadoNoSelect: string = '';
  exercicioEditandoId: number | null = null;

  exercicio = {
    nome: '',
    grupo_muscular: '',
    video_url: '',
    equipamento: ''
  };

  isAdmin = false;
  voltarPara: string = '/home-professor';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ionViewWillEnter() {
    const usuario = this.authService.getUser();
    this.isAdmin = usuario?.tipo === 'admin';
    this.voltarPara = this.isAdmin ? '/home-admin' : '/home-professor';
    this.carregarExercicios();
  }

  carregarExercicios() {
    this.http.get<Exercicio[]>(`${environment.apiUrl}/exercicios`).subscribe({
      next: (lista) => {
        this.todosExercicios = lista;
        this.aplicarPreSelecaoDaUrl();
      },
      error: (err) => console.error('Erro ao carregar exercícios:', err)
    });
  }

  // se veio de "exercicios-lista" com ?grupo=X&exercicioId=Y, já abre
  // direto no modo de edição desse exercício específico
  private aplicarPreSelecaoDaUrl() {
    const grupo = this.route.snapshot.queryParamMap.get('grupo');
    const exercicioId = this.route.snapshot.queryParamMap.get('exercicioId');

    if (grupo && exercicioId) {
      this.grupoSelecionado = grupo;
      this.exercicioSelecionadoNoSelect = exercicioId;
      this.onExercicioSelecionado();
    }
  }

  get exerciciosDoGrupo(): Exercicio[] {
    return this.todosExercicios.filter(e => e.grupo_muscular === this.grupoSelecionado);
  }

  get modoNovo(): boolean {
    return this.exercicioSelecionadoNoSelect === this.OPCAO_NOVO;
  }

  onGrupoChange() {
    this.exercicioSelecionadoNoSelect = '';
    this.resetFormulario();
  }

  onExercicioSelecionado() {
    if (this.modoNovo) {
      this.resetFormulario();
      return;
    }
    const ex = this.todosExercicios.find(e => e.id === Number(this.exercicioSelecionadoNoSelect));
    if (ex) {
      this.exercicioEditandoId = ex.id;
      this.exercicio = {
        nome: ex.nome,
        grupo_muscular: ex.grupo_muscular,
        video_url: ex.video_url || '',
        equipamento: ex.equipamento || ''
      };
    }
  }

  resetFormulario() {
    this.exercicioEditandoId = null;
    this.exercicio = {
      nome: '',
      grupo_muscular: this.grupoSelecionado,
      video_url: '',
      equipamento: ''
    };
  }

  podeSalvar(): boolean {
    if (!this.grupoSelecionado) return false;
    const videoOk = this.exercicio.video_url.trim().length > 0;

    if (this.modoNovo) {
      const nomeOk = this.exercicio.nome.trim().length > 0;
      return nomeOk && videoOk;
    }

    return this.exercicioEditandoId !== null && videoOk;
  }

  salvar() {
    if (!this.podeSalvar()) {
      return;
    }

    const request = this.exercicioEditandoId
      ? this.http.put(`${environment.apiUrl}/exercicios/${this.exercicioEditandoId}`, this.exercicio)
      : this.http.post(`${environment.apiUrl}/exercicios`, this.exercicio);

    request.subscribe({
      next: () => {
        window.location.href = this.voltarPara;
      },
      error: (err) => {
        console.error('Erro ao salvar exercício:', err);
        window.alert(err.error?.error || 'Erro ao salvar exercício.');
      }
    });
  }
}