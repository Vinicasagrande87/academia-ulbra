import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { YoutubeEmbedComponent } from '../youtube-embed/youtube-embed.component';

@Component({
  selector: 'app-exercicio-midia',
  standalone: true,
  imports: [CommonModule, YoutubeEmbedComponent],
  template: `
    <img
      *ngIf="workoutxId"
      [src]="gifUrl"
      alt="Demonstração do exercício"
      class="gif-exercicio">

    <app-youtube-embed
      *ngIf="!workoutxId && videoUrl"
      [url]="videoUrl">
    </app-youtube-embed>
  `,
  styles: [`
    .gif-exercicio {
      width: 100%;
      max-width: 320px;
      display: block;
      margin: 8px auto;
      border-radius: 8px;
      background: #fff;
    }
  `]
})
export class ExercicioMidiaComponent {
  @Input() workoutxId: string | null = null;
  @Input() videoUrl: string | null = null;

  get gifUrl(): string {
    return `${environment.apiUrl}/workoutx/gif/${this.workoutxId}`;
  }
}