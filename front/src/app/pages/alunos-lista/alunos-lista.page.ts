import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-alunos-lista',
  templateUrl: './alunos-lista.page.html',
  styleUrls: ['./alunos-lista.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class AlunosListaPage implements OnInit {

  alunos: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.carregarAlunos();
  }

  carregarAlunos() {
    const token = localStorage.getItem('token');
    // pega o token do professor/admin logado

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get('http://localhost:3000/alunos', { headers }).subscribe({
      next: (res: any) => {
        this.alunos = res;
      },
      error: (err) => {
        console.error('Erro ao carregar alunos:', err);
      }
    });
  }
}