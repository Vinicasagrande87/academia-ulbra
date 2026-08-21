import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"
import { ExercicioMidiaComponent } from '../../components/exercicio-midia/exercicio-midia.component';
// ajuste o caminho conforme onde o componente ficou salvo

@Component({
  selector: 'app-aluno-treinos',
  templateUrl: './aluno-treinos.page.html',
  styleUrls: ['./aluno-treinos.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, ExercicioMidiaComponent]
})
export class AlunoTreinosPage implements OnInit {

  ordemDias = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  treinos: any[] = [];
  carregando = true;
  planoInativo = false;
  mensagemPlanoInativo = '';

  // controla quais exercícios estão com a mídia (gif/vídeo) aberta, pra não
  // carregar tudo de uma vez (pesado se o treino tiver muitos exercícios)
  midiasAbertas = new Set<number>();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.carregarTreinos();
  }

  ionViewWillEnter() {
    this.carregarTreinos();
  }

  carregarTreinos() {
    this.carregando = true;
    this.planoInativo = false;

    this.http.get(`${environment.apiUrl}/alunos/treino`).subscribe({
      next: (res: any) => {
        this.treinos = res.sort((a: any, b: any) =>
          this.ordemDias.indexOf(a.dia_semana) - this.ordemDias.indexOf(b.dia_semana)
        );
        this.carregando = false;
      },
      error: (err) => {
        this.treinos = [];
        this.carregando = false;

        if (err.error?.codigo === 'PLANO_INATIVO') {
          this.planoInativo = true;
          this.mensagemPlanoInativo = err.error.error;
          return;
        }

        if (err.status !== 404) {
          console.error('Erro ao carregar treinos:', err);
        }
      }
    });
  }

  toggleMidia(exercicioId: number) {
    if (this.midiasAbertas.has(exercicioId)) {
      this.midiasAbertas.delete(exercicioId);
    } else {
      this.midiasAbertas.add(exercicioId);
    }
  }

  midiaEstaAberta(exercicioId: number): boolean {
    return this.midiasAbertas.has(exercicioId);
  }
}