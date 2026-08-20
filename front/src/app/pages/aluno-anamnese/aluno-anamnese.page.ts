import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
// ajuste o caminho conforme o nível real da pasta "environments"

// campos de resposta Sim/Não do formulário; guardados como 'sim' | 'nao' | ''
// no front (pra usar em ion-segment) e convertidos pra boolean/null só na
// hora de mandar/receber da API, que guarda tudo como boolean no banco
const CAMPOS_SIM_NAO = [
  'pratica_atividade_atualmente',
  'praticou_atividade_anteriormente',
  'problema_osteoarticular',
  'problema_neuromuscular',
  'problema_coronario',
  'problema_vascular',
  'hospitalizado_5_anos',
  'cirurgia_5_anos'
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
    pratica_atividade_atualmente_qual: '',
    praticou_atividade_anteriormente: '',
    praticou_atividade_anteriormente_qual: '',
    problema_osteoarticular: '',
    problema_osteoarticular_qual: '',
    problema_neuromuscular: '',
    problema_neuromuscular_qual: '',
    problema_coronario: '',
    problema_coronario_qual: '',
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
          for (const campo of CAMPOS_SIM_NAO) {
            this.anamnese[campo] = res[campo] === true ? 'sim' : res[campo] === false ? 'nao' : '';
          }
          this.anamnese.pratica_atividade_atualmente_qual = res.pratica_atividade_atualmente_qual || '';
          this.anamnese.praticou_atividade_anteriormente_qual = res.praticou_atividade_anteriormente_qual || '';
          this.anamnese.problema_osteoarticular_qual = res.problema_osteoarticular_qual || '';
          this.anamnese.problema_neuromuscular_qual = res.problema_neuromuscular_qual || '';
          this.anamnese.problema_coronario_qual = res.problema_coronario_qual || '';
          this.anamnese.contato_emergencia_nome = res.contato_emergencia_nome || '';
          this.anamnese.contato_emergencia_telefone = res.contato_emergencia_telefone || '';
          this.anamnese.contato_emergencia_parentesco = res.contato_emergencia_parentesco || '';
        }
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar anamnese:', err);
        this.carregando = false;
      }
    });
  }

  salvar() {
    const payload: any = { ...this.anamnese };

    for (const campo of CAMPOS_SIM_NAO) {
      payload[campo] = this.anamnese[campo] === 'sim' ? true : this.anamnese[campo] === 'nao' ? false : null;
    }

    this.salvando = true;

    this.http.put(`${environment.apiUrl}/anamnese/${this.alunoId}`, payload).subscribe({
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
