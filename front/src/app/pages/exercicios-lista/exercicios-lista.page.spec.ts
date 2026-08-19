import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExerciciosListaPage } from './exercicios-lista.page';

describe('ExerciciosListaPage', () => {
  let component: ExerciciosListaPage;
  let fixture: ComponentFixture<ExerciciosListaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciciosListaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
