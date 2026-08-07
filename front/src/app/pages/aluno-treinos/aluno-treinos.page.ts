import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"

@Component({
  selector: 'app-aluno-treinos',
  templateUrl: './aluno-treinos.page.html',
  styleUrls: ['./aluno-treinos.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class AlunoTreinosPage implements OnInit {

  ordemDias = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  treinos: any[] = [];
  carregando = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.carregarTreinos();
  }

  ionViewWillEnter() {
    // recarrega toda vez que a página fica visível, caso o professor tenha
    // atualizado algo desde a última vez que o aluno olhou
    this.carregarTreinos();
  }

  carregarTreinos() {
    this.carregando = true;
    // o token é anexado automaticamente pelo authInterceptor; o backend já
    // sabe filtrar só os treinos do aluno logado, sem precisar passar id
    this.http.get(`${environment.apiUrl}/alunos/treino`).subscribe({
      next: (res: any) => {
        this.treinos = res.sort((a: any, b: any) =>
          this.ordemDias.indexOf(a.dia_semana) - this.ordemDias.indexOf(b.dia_semana)
        );
        this.carregando = false;
      },
      error: (err) => {
        // o backend retorna 404 quando o aluno não tem nenhum treino com
        // exercícios ainda — trata como lista vazia, não como erro de verdade
        this.treinos = [];
        this.carregando = false;
        if (err.status !== 404) {
          console.error('Erro ao carregar treinos:', err);
        }
      }
    });
  }
}