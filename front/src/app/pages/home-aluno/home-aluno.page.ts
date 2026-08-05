import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  logOutOutline, 
  barbellOutline, 
  cardOutline, 
  fitnessOutline, 
  timeOutline, 
  personOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-home-aluno',
  templateUrl: './home-aluno.page.html',
  styleUrls: ['./home-aluno.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class HomeAlunoPage {

  constructor(private router: Router) {
    addIcons({
      'log-out-outline': logOutOutline,
      'barbell-outline': barbellOutline,
      'card-outline': cardOutline,
      'fitness-outline': fitnessOutline,
      'time-outline': timeOutline,
      'person-outline': personOutline
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}