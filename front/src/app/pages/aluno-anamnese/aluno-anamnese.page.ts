import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"

// todos os campos são texto livre; a lista abaixo é usada só pra validar
// que nada ficou em branco antes de liberar o botão de salvar
const CAMPOS_OBRIGATORIOS = [
  'pratica_atividade_atualmente',
  'praticou_atividade_anteriormente',
  'problema_osteoarticular',
  'problema_neuromuscular',
  'problema_coronario',
  'problema_vascular',
  'hospitalizado_5_anos',
  'cirurgia_5_anos',
  'contato_emergencia_nome',
  'contato_emergencia_telefone',
  'contato_emergencia_parentesco'
] as const;

@Component({
  selector: 'app-aluno-anamnese',
  templateUrl: './aluno-anamnese.page.html',
  styleUrls: ['./aluno-anamnese.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class AlunoAnamnesePage implements OnInit {

  alunoId: string | null = null;
  nomeAluno: string | null = null;
  carregando = true;
  salvando = false;

  anamnese: any = {
    pratica_atividade_atualmente: '',
    praticou_atividade_anteriormente: '',
    problema_osteoarticular: '',
    problema_neuromuscular: '',
    problema_coronario: '',
    problema_vascular: '',
    hospitalizado_5_anos: '',
    cirurgia_5_anos: '',
    contato_emergencia_nome: '',
    contato_emergencia_telefone: '',
    contato_emergencia_parentesco: ''
  };

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.alunoId = this.route.snapshot.paramMap.get('alunoId');
    const navigation = history.state;
    this.nomeAluno = navigation?.nome || null;

    this.carregarAnamnese();
  }

  carregarAnamnese() {
    this.http.get(`${environment.apiUrl}/anamnese/${this.alunoId}`).subscribe({
      next: (res: any) => {
        if (res) {
          for (const campo of CAMPOS_OBRIGATORIOS) {
            this.anamnese[campo] = res[campo] || '';
          }
        }
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar anamnese:', err);
        this.carregando = false;
      }
    });
  }

  podeSalvar(): boolean {
    return CAMPOS_OBRIGATORIOS.every(campo => !!String(this.anamnese[campo] ?? '').trim());
  }

  salvar() {
    if (!this.podeSalvar()) {
      return;
    }

    this.salvando = true;

    this.http.put(`${environment.apiUrl}/anamnese/${this.alunoId}`, this.anamnese).subscribe({
      next: async () => {
        this.salvando = false;
        const toast = await this.toastController.create({
          message: 'Anamnese salva com sucesso!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
      },
      error: async (err) => {
        this.salvando = false;
        console.error('Erro ao salvar anamnese:', err);
        const toast = await this.toastController.create({
          message: err.error?.error || 'Erro ao salvar anamnese.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}
