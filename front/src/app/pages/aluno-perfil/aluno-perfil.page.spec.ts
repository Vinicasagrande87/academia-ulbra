import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlunoPerfilPage } from './aluno-perfil.page';

describe('AlunoPerfilPage', () => {
  let component: AlunoPerfilPage;
  let fixture: ComponentFixture<AlunoPerfilPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlunoPerfilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
