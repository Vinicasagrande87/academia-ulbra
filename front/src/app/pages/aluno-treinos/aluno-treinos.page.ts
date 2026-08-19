import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"
import { YoutubeEmbedComponent } from '../../components/youtube-embed/youtube-embed.component';
// ajuste o caminho conforme onde o componente ficou salvo

@Component({
  selector: 'app-aluno-treinos',
  templateUrl: './aluno-treinos.page.html',
  styleUrls: ['./aluno-treinos.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, YoutubeEmbedComponent]
})
export class AlunoTreinosPage implements OnInit {

  ordemDias = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  treinos: any[] = [];
  carregando = true;

  // controla quais vídeos estão abertos, pra não carregar todos os iframes
  // de uma vez (pesado se o treino tiver muitos exercícios)
  videosAbertos = new Set<number>();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.carregarTreinos();
  }

  ionViewWillEnter() {
    this.carregarTreinos();
  }

  carregarTreinos() {
    this.carregando = true;
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
        if (err.status !== 404) {
          console.error('Erro ao carregar treinos:', err);
        }
      }
    });
  }

  toggleVideo(exercicioId: number) {
    if (this.videosAbertos.has(exercicioId)) {
      this.videosAbertos.delete(exercicioId);
    } else {
      this.videosAbertos.add(exercicioId);
    }
  }

  videoEstaAberto(exercicioId: number): boolean {
    return this.videosAbertos.has(exercicioId);
  }
}