import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"
import { AuthService } from '../../services/auth';
// ajuste o caminho conforme a pasta real onde o auth.ts está no seu projeto

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
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class ExercicioCadastroPage {

  gruposMusculares = ['Peito', 'Costas', 'Ombro', 'Braço', 'Abdômen', 'Glúteo', 'Pernas'];

  // catálogo completo, carregado do banco assim que a página abre
  todosExercicios: Exercicio[] = [];

  grupoSelecionado = '';

  // valor especial no <ion-select> pra representar "quero cadastrar um novo"
  readonly OPCAO_NOVO = '__novo__';
  exercicioSelecionadoNoSelect: string = '';

  // quando não-nulo, o formulário está editando esse exercício (PUT);
  // quando nulo e a opção "novo" está ativa, está criando (POST)
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
    private authService: AuthService
  ) {}

  ionViewWillEnter() {
    // recalcula toda vez que a página fica visível — o Ionic pode reaproveitar
    // esta instância entre navegações (IonicRouteStrategy)
    const usuario = this.authService.getUser();
    this.isAdmin = usuario?.tipo === 'admin';
    this.voltarPara = this.isAdmin ? '/home-admin' : '/home-professor';
    this.carregarExercicios();
  }

  carregarExercicios() {
    this.http.get<Exercicio[]>(`${environment.apiUrl}/exercicios`).subscribe({
      next: (lista) => this.todosExercicios = lista,
      error: (err) => console.error('Erro ao carregar exercícios:', err)
    });
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

  // checagem manual — não depende do form.valid do Angular, que já se
  // mostrou pouco confiável nesse ambiente de build
  podeSalvar(): boolean {
    if (!this.grupoSelecionado) return false;
    const videoOk = this.exercicio.video_url.trim().length > 0;

    if (this.modoNovo) {
      const nomeOk = this.exercicio.nome.trim().length > 0;
      return nomeOk && videoOk;
    }

    // editando um exercício já existente
    return this.exercicioEditandoId !== null && videoOk;
  }

  salvar() {
    if (!this.podeSalvar()) {
      return; // trava extra, além do [disabled] do botão
    }

    const request = this.exercicioEditandoId
      ? this.http.put(`${environment.apiUrl}/exercicios/${this.exercicioEditandoId}`, this.exercicio)
      : this.http.post(`${environment.apiUrl}/exercicios`, this.exercicio);

    request.subscribe({
      next: () => {
        // window.location.href em vez de router.navigate: garante que a
        // navegação aconteça de forma confiável após salvar
        window.location.href = this.voltarPara;
      },
      error: (err) => {
        console.error('Erro ao salvar exercício:', err);
        window.alert(err.error?.error || 'Erro ao salvar exercício.');
      }
    });
  }
}