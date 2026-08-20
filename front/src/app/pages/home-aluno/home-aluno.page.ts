import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  logOutOutline,
  barbellOutline,
  cardOutline,
  personOutline
} from 'ionicons/icons';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"
import { AuthService } from '../../services/auth';
import { calcularSituacaoPlano } from '../aluno-financeiro/aluno-financeiro.page';
// reaproveita a mesma lógica de cálculo usada na tela financeira do aluno

@Component({
  selector: 'app-home-aluno',
  templateUrl: './home-aluno.page.html',
  styleUrls: ['./home-aluno.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class HomeAlunoPage implements OnInit {

  avisoPlano: { mensagem: string, cor: string } | null = null;
  nomeAluno: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {
    addIcons({
      'log-out-outline': logOutOutline,
      'barbell-outline': barbellOutline,
      'card-outline': cardOutline,
      'person-outline': personOutline
    });
  }

  ngOnInit() {
    this.nomeAluno = this.authService.getUser()?.nome || '';
    this.verificarSituacaoPlano();
  }

  private verificarSituacaoPlano() {
    this.http.get(`${environment.apiUrl}/pagamentos`).subscribe({
      next: (res: any) => {
        const situacao = calcularSituacaoPlano(res);
        // na home só mostra o aviso quando precisa de atenção (vencido,
        // vencendo em breve, ou sem plano nenhum) — se estiver tudo em dia
        // (cor "success"), não exibe nada aqui pra não poluir a tela
        this.avisoPlano = situacao && situacao.cor !== 'success' ? situacao : null;
      },
      error: (err) => console.error('Erro ao verificar situação do plano:', err)
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}