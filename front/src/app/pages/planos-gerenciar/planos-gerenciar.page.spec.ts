import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanosGerenciarPage } from './planos-gerenciar.page';

describe('PlanosGerenciarPage', () => {
  let component: PlanosGerenciarPage;
  let fixture: ComponentFixture<PlanosGerenciarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanosGerenciarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
