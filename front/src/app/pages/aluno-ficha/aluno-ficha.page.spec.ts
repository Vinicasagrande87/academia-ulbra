import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlunoFichaPage } from './aluno-ficha.page';

describe('AlunoFichaPage', () => {
  let component: AlunoFichaPage;
  let fixture: ComponentFixture<AlunoFichaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlunoFichaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
