import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-exercicio-cadastro',
  templateUrl: './exercicio-cadastro.page.html',
  styleUrls: ['./exercicio-cadastro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class ExercicioCadastroPage {

  gruposMusculares = ['Peito', 'Costas', 'Ombro', 'Braço', 'Abdômen', 'Glúteo', 'Pernas'];

  exercicio = {
    nome: '',
    grupo_muscular: '',
    video_url: '',
    equipamento: ''
  };

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  async cadastrarExercicio() {
    this.http.post('http://localhost:3000/exercicios', this.exercicio, { headers: this.getHeaders() }).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Exercício cadastrado com sucesso!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.router.navigate(['/home-professor']);
      },
      error: async (err) => {
        console.error('Erro ao cadastrar exercício:', err);
        const toast = await this.toastController.create({
          message: err.error?.error || 'Erro ao cadastrar exercício.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}