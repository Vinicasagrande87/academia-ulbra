import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  logOutOutline,
  personAddOutline,
  peopleOutline,
  fitnessOutline,
  cardOutline,
  pricetagOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth';
// ajuste o caminho conforme a pasta real onde o auth.ts está no seu projeto

@Component({
  selector: 'app-home-professor',
  templateUrl: './home-professor.page.html',
  styleUrls: ['./home-professor.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class HomeProfessorPage implements OnInit {

  isAdmin = false;
  // controla a seção extra de cards (cadastrar/editar professor, gerenciar
  // planos) que só o admin deve ver — professor mantém só o que já tinha

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    addIcons({
      'log-out-outline': logOutOutline,
      'person-add-outline': personAddOutline,
      'people-outline': peopleOutline,
      'fitness-outline': fitnessOutline,
      'card-outline': cardOutline,
      'pricetag-outline': pricetagOutline
    });
  }

  ngOnInit() {
    this.atualizarTipoUsuario();
  }

  ionViewWillEnter() {
    // o Ionic reaproveita a instância desta página entre navegações
    // (IonicRouteStrategy), então o ngOnInit não roda de novo ao voltar
    // pra cá — sem isso, um professor logando depois de um admin na mesma
    // aba continuaria vendo a seção de admin, com o valor "congelado"
    this.atualizarTipoUsuario();
  }

  private atualizarTipoUsuario() {
    const usuario = this.authService.getUser();
    this.isAdmin = usuario?.tipo === 'admin';
  }

  logout() {
    this.authService.logout();
  }
}