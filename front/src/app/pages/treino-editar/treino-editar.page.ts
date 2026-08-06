import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonCard, IonCardContent, IonItem, IonSelect,
  IonSelectOption, IonInput, IonButton
} from '@ionic/angular/standalone';

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

  // ATENÇÃO: ajuste o nome do parâmetro de rota conforme está no seu app-routing.module.ts
  // (aqui assumi ':treinoId', troque se for diferente, ex: ':id' ou ':alunoId/:dia')
  treinoId: string | null = null;

  dia = '';
  itens: { exercicio_id: number | null, carga: string | null, repeticoes: string | null }[] = [];
  exerciciosCatalogo: any[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.treinoId = this.route.snapshot.paramMap.get('treinoId');
    this.carregarExercicios();
    this.carregarTreino();
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
        this.exerciciosCatalogo = res;
      },
      error: (err) => {
        console.error('Erro ao carregar exercícios:', err);
      }
    });
  }

  carregarTreino() {
    if (!this.treinoId) { return; }
    this.http.get(`http://localhost:3000/treinos/${this.treinoId}`, { headers: this.getHeaders() }).subscribe({
      next: (res: any) => {
        this.dia = res.dia_semana;
        this.itens = (res.itens || res.exercicios || []).map((item: any) => ({
          exercicio_id: item.exercicio_id,
          carga: item.carga,
          repeticoes: item.repeticoes
        }));
      },
      error: (err) => {
        console.error('Erro ao carregar treino:', err);
      }
    });
  }

  adicionarItem() {
    this.itens.push({ exercicio_id: null, carga: null, repeticoes: null });
  }

  removerItem(index: number) {
    this.itens.splice(index, 1);
  }

  async salvarEdicao() {
    const treino = {
      dia_semana: this.dia,
      exercicios: this.itens.map((item, i) => ({
        exercicio_id: item.exercicio_id,
        carga: item.carga,
        repeticoes: item.repeticoes,
        ordem: i + 1
      }))
    };

    this.http.put(`http://localhost:3000/treinos/${this.treinoId}`, treino, { headers: this.getHeaders() }).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Treino atualizado com sucesso!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.router.navigate(['/aluno-ficha']);
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