import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
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
    private toastController: ToastController,
    private router: Router,
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
    // sem page/limit na query, o backend devolve a lista inteira de uma vez
    this.http.get<Exercicio[]>(`${environment.apiUrl}/exercicios`).subscribe({
      next: (lista) => this.todosExercicios = lista,
      error: (err) => console.error('Erro ao carregar exercícios:', err)
    });
  }

  get exerciciosDoGrupo(): Exercicio[] {
    return this.todosExercicios.filter(e => e.grupo_muscular === this.grupoSelecionado);
  }

  onGrupoChange() {
    this.exercicioSelecionadoNoSelect = '';
    this.resetFormulario();
  }

  onExercicioSelecionado() {
    if (this.exercicioSelecionadoNoSelect === this.OPCAO_NOVO) {
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

  async salvar() {
    // PUT se está editando um exercício existente, POST se é novo
    const request = this.exercicioEditandoId
      ? this.http.put(`${environment.apiUrl}/exercicios/${this.exercicioEditandoId}`, this.exercicio)
      : this.http.post(`${environment.apiUrl}/exercicios`, this.exercicio);

    request.subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: this.exercicioEditandoId
            ? 'Exercício atualizado com sucesso!'
            : 'Exercício cadastrado com sucesso!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.exercicioSelecionadoNoSelect = '';
        this.resetFormulario();
        this.carregarExercicios(); // recarrega a lista com o dado novo/atualizado
      },
      error: async (err) => {
        console.error('Erro ao salvar exercício:', err);
        const toast = await this.toastController.create({
          message: err.error?.error || 'Erro ao salvar exercício.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}