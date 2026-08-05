import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlunoCadastroPage } from './aluno-cadastro.page';

describe('AlunoCadastroPage', () => {
  let component: AlunoCadastroPage;
  let fixture: ComponentFixture<AlunoCadastroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlunoCadastroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
