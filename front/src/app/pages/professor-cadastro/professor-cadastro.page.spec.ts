import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfessorCadastroPage } from './professor-cadastro.page';

describe('ProfessorCadastroPage', () => {
  let component: ProfessorCadastroPage;
  let fixture: ComponentFixture<ProfessorCadastroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfessorCadastroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
