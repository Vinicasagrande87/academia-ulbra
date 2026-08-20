import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { medkitOutline, searchOutline, searchSharp, closeCircle, closeSharp } from 'ionicons/icons';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-anamnese-lista',
  templateUrl: './anamnese-lista.page.html',
  styleUrls: ['./anamnese-lista.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class AnamneseListaPage implements OnInit {
  // lista simples de alunos só pra escolher de quem preencher/ver a
  // anamnese; o CRUD financeiro fica só na tela "Alunos Matriculados"

  alunos: any[] = [];
  filtro = '';
  voltarPara: string = '/home-professor';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    addIcons({
      'medkit-outline': medkitOutline,
      'search-outline': searchOutline,
      'search-sharp': searchSharp,
      'close-circle': closeCircle,
      'close-sharp': closeSharp
    });
  }

  ngOnInit() {
    this.carregarAlunos();
  }

  ionViewWillEnter() {
    const usuario = this.authService.getUser();
    this.voltarPara = usuario?.tipo === 'admin' ? '/home-admin' : '/home-professor';
  }

  carregarAlunos() {
    this.http.get(`${environment.apiUrl}/alunos`).subscribe({
      next: (res: any) => {
        this.alunos = res;
      },
      error: (err) => {
        console.error('Erro ao carregar alunos:', err);
      }
    });
  }

  alunosFiltrados() {
    const termo = this.filtro.trim().toLowerCase();
    if (!termo) return this.alunos;
    return this.alunos.filter(a => a.nome.toLowerCase().includes(termo));
  }
}
