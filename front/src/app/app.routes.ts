import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

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
    canActivate: [authGuard],
    data: { roles: ['admin', 'professor'] },
    loadComponent: () => import('./pages/aluno-cadastro/aluno-cadastro.page').then( m => m.AlunoCadastroPage)
  },
  {
    path: 'home-professor',
    canActivate: [authGuard],
    data: { roles: ['admin', 'professor'] },
    loadComponent: () => import('./pages/home-professor/home-professor.page').then( m => m.HomeProfessorPage)
  },
  {
    path: 'home-admin',
    canActivate: [authGuard],
    data: { roles: ['admin', 'professor'] },
    loadComponent: () => import('./pages/home-professor/home-professor.page').then( m => m.HomeProfessorPage)
  },
  {
    path: 'home-aluno',
    canActivate: [authGuard],
    data: { roles: ['aluno'] },
    loadComponent: () => import('./pages/home-aluno/home-aluno.page').then( m => m.HomeAlunoPage)
  },
  {
    path: 'alunos-lista',
    canActivate: [authGuard],
    data: { roles: ['admin', 'professor'] },
    loadComponent: () => import('./pages/alunos-lista/alunos-lista.page').then( m => m.AlunosListaPage)
  },
  {
    path: 'aluno-ficha/:id',
    canActivate: [authGuard],
    data: { roles: ['admin', 'professor'] },
    loadComponent: () => import('./pages/aluno-ficha/aluno-ficha.page').then( m => m.AlunoFichaPage)
  },
  {
    path: 'aluno-perfil',
    canActivate: [authGuard],
    data: { roles: ['aluno'] },
    loadComponent: () => import('./pages/aluno-perfil/aluno-perfil.page').then( m => m.AlunoPerfilPage)
  },
  {
    path: 'treino-cadastro/:alunoId',
    canActivate: [authGuard],
    data: { roles: ['admin', 'professor'] },
    loadComponent: () => import('./pages/treino-cadastro/treino-cadastro.page').then( m => m.TreinoCadastroPage)
  },
  {
    path: 'exercicio-cadastro',
    canActivate: [authGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./pages/exercicio-cadastro/exercicio-cadastro.page').then( m => m.ExercicioCadastroPage)
  },
  {
    path: 'exercicios-lista',
    canActivate: [authGuard],
    data: { roles: ['admin', 'professor'] },
    loadComponent: () => import('./pages/exercicios-lista/exercicios-lista.page').then( m => m.ExerciciosListaPage)
  },
  {
    path: 'treino-editar/:alunoId/:dia',
    canActivate: [authGuard],
    data: { roles: ['admin', 'professor'] },
    loadComponent: () => import('./pages/treino-editar/treino-editar.page').then( m => m.TreinoEditarPage)
  },
  {
    path: 'financeiro',
    canActivate: [authGuard],
    data: { roles: ['admin', 'professor'] },
    loadComponent: () => import('./pages/financeiro/financeiro.page').then( m => m.FinanceiroPage)
  },
  {
    path: 'aluno-financeiro',
    canActivate: [authGuard],
    data: { roles: ['aluno'] },
    loadComponent: () => import('./pages/aluno-financeiro/aluno-financeiro.page').then( m => m.AlunoFinanceiroPage)
  },
  {
    path: 'professor-cadastro',
    canActivate: [authGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./pages/professor-cadastro/professor-cadastro.page').then( m => m.ProfessorCadastroPage)
  },
  {
    path: 'professores-lista',
    canActivate: [authGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./pages/professores-lista/professores-lista.page').then( m => m.ProfessoresListaPage)
  },
  {
    path: 'planos-gerenciar',
    canActivate: [authGuard],
    data: { roles: ['admin', 'professor'] },
    loadComponent: () => import('./pages/planos-gerenciar/planos-gerenciar.page').then( m => m.PlanosGerenciarPage)
  },
  {
    path: 'aluno-treinos',
    canActivate: [authGuard],
    data: { roles: ['aluno'] },
    loadComponent: () => import('./pages/aluno-treinos/aluno-treinos.page').then( m => m.AlunoTreinosPage)
  },
];
