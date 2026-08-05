import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  logOutOutline, 
  personAddOutline, 
  peopleOutline, 
  barbellOutline, 
  createOutline, 
  fitnessOutline, 
  cardOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-home-professor',
  templateUrl: './home-professor.page.html',
  styleUrls: ['./home-professor.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class HomeProfessorPage {

  constructor(private router: Router) {
    // Registra todos os ícones utilizados nos cards e no cabeçalho
    addIcons({
      'log-out-outline': logOutOutline,
      'person-add-outline': personAddOutline,
      'people-outline': peopleOutline,
      'barbell-outline': barbellOutline,
      'create-outline': createOutline,
      'fitness-outline': fitnessOutline,
      'card-outline': cardOutline
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}