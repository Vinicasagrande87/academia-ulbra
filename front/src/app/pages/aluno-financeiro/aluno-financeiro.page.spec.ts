import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlunoFinanceiroPage } from './aluno-financeiro.page';

describe('AlunoFinanceiroPage', () => {
  let component: AlunoFinanceiroPage;
  let fixture: ComponentFixture<AlunoFinanceiroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlunoFinanceiroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
