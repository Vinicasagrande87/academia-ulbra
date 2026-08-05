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
];