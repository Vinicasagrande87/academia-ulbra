import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth';
import { ExercicioMidiaComponent } from '../../components/exercicio-midia/exercicio-midia.component';

interface Exercicio {
  id: number;
  nome: string;
  grupo_muscular: string;
  video_url: string;
  equipamento: string;
  workoutx_id: string | null;
}

interface ResultadoBuscaWorkoutX {
  workoutx_id: string;
  nome_original: string;
  bodyPart: string;
  target: string;
  equipment: string;
}

@Component({
  selector: 'app-exercicio-cadastro',
  templateUrl: './exercicio-cadastro.page.html',
  styleUrls: ['./exercicio-cadastro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ExercicioMidiaComponent]
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
    equipamento: '',
    workoutx_id: null as string | null
  };

  // busca no catálogo WorkoutX
  termoBusca = '';
  buscando = false;
  resultadosBusca: ResultadoBuscaWorkoutX[] = [];
  jaBuscou = false;

  isAdmin = false;
  voltarPara: string = '/home-professor';
  apiUrl = environment.apiUrl;
  // exposto pro template poder montar a URL da miniatura do gif

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
        equipamento: ex.equipamento || '',
        workoutx_id: ex.workoutx_id || null
      };
      this.limparBusca();
    }
  }

  resetFormulario() {
    this.exercicioEditandoId = null;
    this.exercicio = {
      nome: '',
      grupo_muscular: this.grupoSelecionado,
      video_url: '',
      equipamento: '',
      workoutx_id: null
    };
    this.limparBusca();
  }

  limparBusca() {
    this.termoBusca = '';
    this.resultadosBusca = [];
    this.jaBuscou = false;
  }

  buscarNoWorkoutX() {
    if (!this.termoBusca.trim()) return;

    this.buscando = true;
    this.jaBuscou = true;

    this.http.get<{ termo_traduzido: string, resultados: ResultadoBuscaWorkoutX[] }>(
      `${environment.apiUrl}/workoutx/search`,
      { params: { name: this.termoBusca.trim() } }
    ).subscribe({
      next: (res) => {
        this.resultadosBusca = res.resultados;
        this.buscando = false;
      },
      error: (err) => {
        console.error('Erro ao buscar no WorkoutX:', err);
        this.resultadosBusca = [];
        this.buscando = false;
      }
    });
  }

  escolherResultado(resultado: ResultadoBuscaWorkoutX) {
    this.exercicio.workoutx_id = resultado.workoutx_id;
    if (this.modoNovo && !this.exercicio.nome.trim()) {
      this.exercicio.nome = resultado.nome_original;
    }
  }

  podeSalvar(): boolean {
    if (!this.grupoSelecionado) return false;
    if (!this.exercicio.workoutx_id) return false;

    if (this.modoNovo) {
      return this.exercicio.nome.trim().length > 0;
    }

    return this.exercicioEditandoId !== null;
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