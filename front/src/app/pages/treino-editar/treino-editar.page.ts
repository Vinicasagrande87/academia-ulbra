import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonCard, IonCardContent, IonItem, IonSelect,
  IonSelectOption, IonInput, IonButton
} from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"

@Component({
  selector: 'app-treino-editar',
  templateUrl: './treino-editar.page.html',
  styleUrls: ['./treino-editar.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
    IonContent, IonCard, IonCardContent, IonItem, IonSelect,
    IonSelectOption, IonInput, IonButton
  ]
})
export class TreinoEditarPage implements OnInit {

  // rota é /treino-editar/:alunoId/:dia (ex: /treino-editar/1/Segunda-feira)
  alunoId: string | null = null;
  dia = '';

  treinoId: number | null = null;
  // id do registro em "treinos", descoberto depois de buscar a lista do aluno
  // e filtrar pelo dia_semana. É esse id que usamos no PUT pra salvar.

  gruposMusculares = ['Peito', 'Costas', 'Ombro', 'Braço', 'Abdômen', 'Glúteo', 'Pernas'];

  itens: { grupo: string, exercicio_id: number | null, carga: string | null, repeticoes: string | null }[] = [];
  exerciciosCatalogo: any[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.alunoId = this.route.snapshot.paramMap.get('alunoId');
    this.dia = this.route.snapshot.paramMap.get('dia') || '';

    this.carregarExercicios();
  }

  carregarExercicios() {
    // o token é anexado automaticamente pelo authInterceptor
    this.http.get(`${environment.apiUrl}/exercicios`).subscribe({
      next: (res: any) => {
        this.exerciciosCatalogo = res;
        this.carregarTreino();
        // só busca o treino depois do catálogo estar carregado, pra já
        // conseguir preencher o campo "grupo" de cada item existente
      },
      error: (err) => {
        console.error('Erro ao carregar exercícios:', err);
      }
    });
  }

  exerciciosDoGrupo(grupo: string) {
    return this.exerciciosCatalogo.filter(ex => ex.grupo_muscular === grupo);
  }

  carregarTreino() {
    if (!this.alunoId) { return; }

    this.http.get(`${environment.apiUrl}/treinos?aluno_id=${this.alunoId}`).subscribe({
      next: (res: any) => {
        const treinoDoDia = res.find((t: any) => t.dia_semana === this.dia);

        if (!treinoDoDia) {
          console.error('Nenhum treino encontrado para esse dia.');
          return;
        }

        this.treinoId = treinoDoDia.id;
        this.itens = (treinoDoDia.exercicios || [])
          .sort((a: any, b: any) => a.ordem - b.ordem)
          .map((item: any) => {
            const exNoCatalogo = this.exerciciosCatalogo.find(ex => ex.id === item.exercicio_id);
            return {
              grupo: exNoCatalogo ? exNoCatalogo.grupo_muscular : '',
              exercicio_id: item.exercicio_id,
              carga: item.carga,
              repeticoes: item.repeticoes
            };
          });
      },
      error: (err) => {
        console.error('Erro ao carregar treino:', err);
      }
    });
  }

  adicionarItem() {
    this.itens.push({ grupo: '', exercicio_id: null, carga: null, repeticoes: null });
  }

  removerItem(index: number) {
    this.itens.splice(index, 1);
  }

  async salvarEdicao() {
    if (!this.treinoId) {
      const toast = await this.toastController.create({
        message: 'Não foi possível identificar o treino a ser editado.',
        duration: 2500,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    const treino = {
      dia_semana: this.dia,
      exercicios: this.itens.map((item, i) => ({
        exercicio_id: item.exercicio_id,
        carga: item.carga,
        repeticoes: item.repeticoes,
        ordem: i + 1
      }))
    };

    this.http.put(`${environment.apiUrl}/treinos/${this.treinoId}`, treino).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Treino atualizado com sucesso!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.router.navigate(['/aluno-ficha', this.alunoId]);
      },
      error: async (err) => {
        console.error('Erro ao salvar edição:', err);
        const toast = await this.toastController.create({
          message: err.error?.error || 'Erro ao salvar alterações.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}