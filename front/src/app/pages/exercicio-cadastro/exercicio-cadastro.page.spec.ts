import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExercicioCadastroPage } from './exercicio-cadastro.page';

describe('ExercicioCadastroPage', () => {
  let component: ExercicioCadastroPage;
  let fixture: ComponentFixture<ExercicioCadastroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExercicioCadastroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
