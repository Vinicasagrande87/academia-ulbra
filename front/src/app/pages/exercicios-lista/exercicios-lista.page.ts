import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { searchOutline, searchSharp, closeCircle, closeSharp } from 'ionicons/icons';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"
import { AuthService } from '../../services/auth';
// ajuste o caminho conforme a pasta real onde o auth.ts está no seu projeto

interface Exercicio {
  id: number;
  nome: string;
  grupo_muscular: string;
  video_url: string;
  equipamento: string;
}

@Component({
  selector: 'app-exercicios-lista',
  templateUrl: './exercicios-lista.page.html',
  styleUrls: ['./exercicios-lista.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class ExerciciosListaPage implements OnInit {

  exercicios: Exercicio[] = [];
  filtro = '';
  isAdmin = false;
  voltarPara: string = '/exercicio-cadastro';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    addIcons({
      'search-outline': searchOutline,
      'search-sharp': searchSharp,
      'close-circle': closeCircle,
      'close-sharp': closeSharp
    });
  }

  ngOnInit() {
    this.carregarExercicios();
  }

  ionViewWillEnter() {
    const usuario = this.authService.getUser();
    this.isAdmin = usuario?.tipo === 'admin';
    // professor não tem acesso a /exercicio-cadastro (rota restrita a admin),
    // então o botão de voltar precisa apontar pra home de cada papel
    this.voltarPara = this.isAdmin ? '/exercicio-cadastro' : '/home-professor';
    this.carregarExercicios();
  }

  carregarExercicios() {
    this.http.get<Exercicio[]>(`${environment.apiUrl}/exercicios`).subscribe({
      next: (lista) => {
        // ordena por grupo muscular e depois por nome, pra ficar fácil de
        // escanear visualmente e notar duplicidade
        this.exercicios = lista.sort((a, b) =>
          a.grupo_muscular.localeCompare(b.grupo_muscular) || a.nome.localeCompare(b.nome)
        );
      },
      error: (err) => console.error('Erro ao carregar exercícios:', err)
    });
  }

  exerciciosFiltrados(): Exercicio[] {
    const termo = this.filtro.trim().toLowerCase();
    if (!termo) return this.exercicios;
    return this.exercicios.filter(ex =>
      ex.nome.toLowerCase().includes(termo) ||
      ex.grupo_muscular.toLowerCase().includes(termo)
    );
  }

  editar(ex: Exercicio) {
    // leva pra tela de cadastro já com o grupo e o exercício pré-selecionados,
    // abrindo direto no modo de edição
    this.router.navigate(['/exercicio-cadastro'], {
      queryParams: { grupo: ex.grupo_muscular, exercicioId: ex.id }
    });
  }
}