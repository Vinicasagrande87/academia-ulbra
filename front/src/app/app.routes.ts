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
];