import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-aluno-cadastro',
  templateUrl: './aluno-cadastro.page.html',
  styleUrls: ['./aluno-cadastro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class AlunoCadastroPage {

  aluno = {
    nome: '',
    idade: '',
    peso: '',
    altura: '',
    cpf: '',
    telefone: '',
    email: '',
    senha: '',
    finalidade: ''
  };

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router
  ) {}

  async cadastrarAluno() {
    const token = localStorage.getItem('token'); // Pega o token do professor/admin logado

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Converte os campos de texto para números antes de enviar para o back-end
    const alunoParaEnviar = {
      ...this.aluno,
      idade: this.aluno.idade ? Number(this.aluno.idade) : null,
      peso: this.aluno.peso ? parseFloat(String(this.aluno.peso).replace(',', '.')) : null,
      altura: this.aluno.altura ? parseFloat(String(this.aluno.altura).replace(',', '.')) : null
    };

    this.http.post('http://localhost:3000/alunos', alunoParaEnviar, { headers }).subscribe({
      next: async (res: any) => {
        const toast = await this.toastController.create({
          message: 'Aluno cadastrado com sucesso!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.router.navigate(['/home-professor']);
      },
      error: async (err) => {
        console.error('ERRO COMPLETO DO BACKEND:', err);
        const toast = await this.toastController.create({
          message: err.error?.error || 'Erro ao cadastrar aluno.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}