import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-aluno-ficha',
  templateUrl: './aluno-ficha.page.html',
  styleUrls: ['./aluno-ficha.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class AlunoFichaPage implements OnInit {

  // ordem fixa dos dias, usada só pra ordenar a lista que vem do back
  ordemDias = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  treinos: any[] = [];
  alunoId: string | null = null;
  nomeAluno: string | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.alunoId = this.route.snapshot.paramMap.get('id');
    // pega o nome do aluno se ele veio junto na navegação (opcional, só pra exibir no título)
    const navigation = history.state;
    this.nomeAluno = navigation?.nome || null;

    this.carregarTreinos();
  }

  carregarTreinos() {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`http://localhost:3000/treinos?aluno_id=${this.alunoId}`, { headers }).subscribe({
      next: (res: any) => {
        // ordena os treinos de segunda a sábado, em vez da ordem que veio do banco
        this.treinos = res.sort((a: any, b: any) =>
          this.ordemDias.indexOf(a.dia_semana) - this.ordemDias.indexOf(b.dia_semana)
        );
      },
      error: (err) => {
        console.error('Erro ao carregar treinos do aluno:', err);
      }
    });
  }
}