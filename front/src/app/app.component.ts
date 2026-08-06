import { Component } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private router: Router) {
    // tira o foco do elemento ativo antes de cada navegação,
    // evita o aviso de aria-hidden em elemento que ainda está com foco
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        (document.activeElement as HTMLElement)?.blur();
      }
    });
  }
}