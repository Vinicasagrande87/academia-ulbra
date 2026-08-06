import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreinoCadastroPage } from './treino-cadastro.page';

describe('TreinoCadastroPage', () => {
  let component: TreinoCadastroPage;
  let fixture: ComponentFixture<TreinoCadastroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TreinoCadastroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
