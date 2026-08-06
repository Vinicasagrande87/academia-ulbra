import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';

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
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.carregarPerfil();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  carregarPerfil() {
    this.http.get('http://localhost:3000/alunos/perfil', { headers: this.getHeaders() }).subscribe({
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
      error: async (err) => {
        console.error('Erro ao carregar perfil:', err);
        const toast = await this.toastController.create({
          message: 'Erro ao carregar seus dados.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  async salvarPerfil() {
    // converte peso/altura pra número, aceitando vírgula ou ponto na digitação
    const alunoParaEnviar = {
      ...this.aluno,
      peso: this.aluno.peso ? parseFloat(String(this.aluno.peso).replace(',', '.')) : null,
      altura: this.aluno.altura ? parseFloat(String(this.aluno.altura).replace(',', '.')) : null
    };

    this.http.put('http://localhost:3000/alunos', alunoParaEnviar, { headers: this.getHeaders() }).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Perfil atualizado com sucesso!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
      },
      error: async (err) => {
        console.error('Erro ao salvar perfil:', err);
        const toast = await this.toastController.create({
          message: err.error?.error || 'Erro ao atualizar perfil.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}