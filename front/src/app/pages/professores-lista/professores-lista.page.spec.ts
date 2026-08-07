import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfessoresListaPage } from './professores-lista.page';

describe('ProfessoresListaPage', () => {
  let component: ProfessoresListaPage;
  let fixture: ComponentFixture<ProfessoresListaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfessoresListaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
