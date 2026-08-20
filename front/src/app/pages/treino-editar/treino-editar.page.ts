import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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

  alunoId: string | null = null;
  dia = '';

  treinoId: number | null = null;

  gruposMusculares = ['Peito', 'Costas', 'Ombro', 'Braço', 'Abdômen', 'Glúteo', 'Pernas'];

  itens: { grupo: string, exercicio_id: number | null, carga: string | null, repeticoes: string | null }[] = [];
  exerciciosCatalogo: any[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.alunoId = this.route.snapshot.paramMap.get('alunoId');
    this.dia = this.route.snapshot.paramMap.get('dia') || '';

    this.carregarExercicios();
  }

  carregarExercicios() {
    this.http.get(`${environment.apiUrl}/exercicios`).subscribe({
      next: (res: any) => {
        this.exerciciosCatalogo = res;
        this.carregarTreino();
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

  podeSalvar(): boolean {
    if (this.itens.length === 0) return false;

    return this.itens.every(item =>
      !!item.grupo &&
      !!item.exercicio_id &&
      !!String(item.carga ?? '').trim() &&
      !!String(item.repeticoes ?? '').trim()
    );
  }

  salvarEdicao() {
    if (!this.podeSalvar()) {
      this.ngZone.run(async () => {
        const toast = await this.toastController.create({
          message: 'Preencha grupo, exercício, carga e repetições de todos os itens.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      });
      return;
    }

    if (!this.treinoId) {
      this.ngZone.run(async () => {
        const toast = await this.toastController.create({
          message: 'Não foi possível identificar o treino a ser editado.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      });
      return;
    }

    const treino = {
      dia_semana: this.dia,
      exercicios: this.itens.map((item, i) => ({
        exercicio_id: item.exercicio_id,
        carga: item.carga !== null && item.carga !== undefined && String(item.carga).trim() !== ''
          ? parseInt(String(item.carga).replace(/\D/g, ''), 10)
          : null,
        repeticoes: item.repeticoes,
        ordem: i + 1
      }))
    };

    this.http.put(`${environment.apiUrl}/treinos/${this.treinoId}`, treino).subscribe({
      next: () => {
        // window.location.href em vez de router.navigate: garante que a
        // navegação aconteça de forma confiável após salvar, igual fizemos
        // nas outras telas de cadastro/edição
        window.location.href = `/aluno-ficha/${this.alunoId}`;
      },
      error: (err) => {
        console.error('Erro ao salvar edição:', err);
        this.ngZone.run(async () => {
          const toast = await this.toastController.create({
            message: err.error?.error || 'Erro ao salvar alterações.',
            duration: 2500,
            color: 'danger'
          });
          await toast.present();
        });
      }
    });
  }
}