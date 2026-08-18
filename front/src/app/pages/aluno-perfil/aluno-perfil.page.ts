import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"

@Component({
  selector: 'app-aluno-perfil',
  templateUrl: './aluno-perfil.page.html',
  styleUrls: ['./aluno-perfil.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class AlunoPerfilPage implements OnInit {

  aluno = {
    nome: '',
    peso: '',
    altura: '',
    cpf: '',
    telefone: '',
    email: '',
    finalidade: ''
  };

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private ngZone: NgZone
    // necessário pro toast aparecer de forma confiável — ver comentário
    // detalhado em login.page.ts sobre o motivo
  ) {}

  ngOnInit() {
    this.carregarPerfil();
  }

  carregarPerfil() {
    // o token é anexado automaticamente pelo authInterceptor
    this.http.get(`${environment.apiUrl}/alunos/perfil`).subscribe({
      next: (res: any) => {
        this.aluno = {
          nome: res.nome || '',
          peso: res.peso || '',
          altura: res.altura || '',
          cpf: res.cpf || '',
          telefone: res.telefone || '',
          email: res.email || '',
          finalidade: res.finalidade || ''
        };
      },
      error: (err) => {
        console.error('Erro ao carregar perfil:', err);
        this.ngZone.run(async () => {
          const toast = await this.toastController.create({
            message: 'Erro ao carregar seus dados.',
            duration: 2500,
            color: 'danger'
          });
          await toast.present();
        });
      }
    });
  }

  salvarPerfil() {
    // converte peso/altura pra número, aceitando vírgula ou ponto na digitação
    const alunoParaEnviar = {
      ...this.aluno,
      peso: this.aluno.peso ? parseFloat(String(this.aluno.peso).replace(',', '.')) : null,
      altura: this.aluno.altura ? parseFloat(String(this.aluno.altura).replace(',', '.')) : null
    };

    this.http.put(`${environment.apiUrl}/alunos`, alunoParaEnviar).subscribe({
      next: () => {
        this.ngZone.run(async () => {
          const toast = await this.toastController.create({
            message: 'Perfil atualizado com sucesso!',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        });
      },
      error: (err) => {
        console.error('Erro ao salvar perfil:', err);
        this.ngZone.run(async () => {
          const toast = await this.toastController.create({
            message: err.error?.error || 'Erro ao atualizar perfil.',
            duration: 2500,
            color: 'danger'
          });
          await toast.present();
        });
      }
    });
  }
}