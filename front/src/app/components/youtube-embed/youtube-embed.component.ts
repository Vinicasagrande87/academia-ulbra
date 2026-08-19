import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-youtube-embed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="youtube-embed-wrapper" *ngIf="embedUrl; else linkInvalido">
      <iframe
        [src]="embedUrl"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen>
      </iframe>
    </div>
    <ng-template #linkInvalido>
      <p *ngIf="url" class="video-invalido">Link de vídeo inválido.</p>
    </ng-template>
  `,
  styles: [`
    .youtube-embed-wrapper {
      position: relative;
      width: 100%;
      padding-top: 56.25%; /* mantém a proporção 16:9 em qualquer largura de tela */
      margin: 8px 0;
      border-radius: 8px;
      overflow: hidden;
      background: #000;
    }
    .youtube-embed-wrapper iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }
    .video-invalido {
      color: var(--ion-color-danger, #eb445a);
      font-size: 0.85rem;
    }
  `]
})
export class YoutubeEmbedComponent implements OnChanges {
  @Input() url: string = '';
  embedUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    const id = this.extrairId(this.url);
    // bypassSecurityTrustResourceUrl é necessário porque o Angular bloqueia
    // por padrão URLs dinâmicas indo pra dentro de um iframe (proteção XSS);
    // aqui é seguro porque sempre montamos a URL nós mesmos, com um ID
    // validado por regex, nunca inserindo a string bruta do usuário
    this.embedUrl = id
      ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`)
      : null;
  }

  private extrairId(url: string): string | null {
    if (!url) return null;
    // cobre os formatos: watch?v=, youtu.be/, embed/, shorts/, v/
    const regExp = /^.*(?:youtu\.be\/|v\/|shorts\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#&?]{11}).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  }
}