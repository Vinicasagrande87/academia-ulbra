import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"
import { AuthService } from '../../services/auth';
// ajuste o caminho conforme a pasta real onde o auth.ts está no seu projeto

@Component({
  selector: 'app-alunos-lista',
  templateUrl: './alunos-lista.page.html',
  styleUrls: ['./alunos-lista.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class AlunosListaPage implements OnInit {

  alunos: any[] = [];
  filtro = '';
  // texto digitado na busca; a filtragem acontece no cliente, sem nova
  // chamada ao backend, já que a lista de alunos costuma ser pequena

  voltarPara: string = '/home-professor';
  // o botão de voltar precisa saber se quem está aqui é admin ou professor,
  // já que os dois têm painéis (URLs) diferentes agora

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.carregarAlunos();
  }

  ionViewWillEnter() {
    // recalcula toda vez que a página fica visível — o Ionic pode reaproveitar
    // esta instância entre navegações (IonicRouteStrategy), então isso evita
    // que o valor fique "preso" de um login anterior na mesma aba
    const usuario = this.authService.getUser();
    this.voltarPara = usuario?.tipo === 'admin' ? '/home-admin' : '/home-professor';
  }

  carregarAlunos() {
    // o token é anexado automaticamente pelo authInterceptor
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

    if (!termo) {
      return this.alunos;
    }

    return this.alunos.filter(aluno =>
      aluno.nome.toLowerCase().includes(termo)
    );
  }
}