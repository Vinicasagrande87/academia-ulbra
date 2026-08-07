import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'aluno-cadastro',
    loadComponent: () => import('./pages/aluno-cadastro/aluno-cadastro.page').then( m => m.AlunoCadastroPage)
  },
  {
    path: 'home-professor',
    loadComponent: () => import('./pages/home-professor/home-professor.page').then( m => m.HomeProfessorPage)
  },
  {
    path: 'home-admin',
    loadComponent: () => import('./pages/home-professor/home-professor.page').then( m => m.HomeProfessorPage)
  },
  {
    path: 'home-aluno',
    loadComponent: () => import('./pages/home-aluno/home-aluno.page').then( m => m.HomeAlunoPage)
  },
  {
    path: 'alunos-lista',
    loadComponent: () => import('./pages/alunos-lista/alunos-lista.page').then( m => m.AlunosListaPage)
  },
  {
    path: 'aluno-ficha/:id',
    loadComponent: () => import('./pages/aluno-ficha/aluno-ficha.page').then( m => m.AlunoFichaPage)
  },
  {
    path: 'aluno-perfil',
    loadComponent: () => import('./pages/aluno-perfil/aluno-perfil.page').then( m => m.AlunoPerfilPage)
  },
  {
    path: 'treino-cadastro/:alunoId',
    loadComponent: () => import('./pages/treino-cadastro/treino-cadastro.page').then( m => m.TreinoCadastroPage)
  },
  {
    path: 'exercicio-cadastro',
    loadComponent: () => import('./pages/exercicio-cadastro/exercicio-cadastro.page').then( m => m.ExercicioCadastroPage)
  },
  {
    path: 'treino-editar/:alunoId/:dia',
    loadComponent: () => import('./pages/treino-editar/treino-editar.page').then( m => m.TreinoEditarPage)
  },
  {
    path: 'financeiro',
    loadComponent: () => import('./pages/financeiro/financeiro.page').then( m => m.FinanceiroPage)
  },
  {
    path: 'aluno-financeiro',
    loadComponent: () => import('./pages/aluno-financeiro/aluno-financeiro.page').then( m => m.AlunoFinanceiroPage)
  },
  {
    path: 'professor-cadastro',
    loadComponent: () => import('./pages/professor-cadastro/professor-cadastro.page').then( m => m.ProfessorCadastroPage)
  },
  {
    path: 'professores-lista',
    loadComponent: () => import('./pages/professores-lista/professores-lista.page').then( m => m.ProfessoresListaPage)
  },
  {
    path: 'planos-gerenciar',
    loadComponent: () => import('./pages/planos-gerenciar/planos-gerenciar.page').then( m => m.PlanosGerenciarPage)
  },
  {
    path: 'aluno-treinos',
    loadComponent: () => import('./pages/aluno-treinos/aluno-treinos.page').then( m => m.AlunoTreinosPage)
  },
];