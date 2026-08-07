import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlunoTreinosPage } from './aluno-treinos.page';

describe('AlunoTreinosPage', () => {
  let component: AlunoTreinosPage;
  let fixture: ComponentFixture<AlunoTreinosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlunoTreinosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
