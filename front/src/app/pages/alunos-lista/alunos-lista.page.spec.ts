import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlunosListaPage } from './alunos-lista.page';

describe('AlunosListaPage', () => {
  let component: AlunosListaPage;
  let fixture: ComponentFixture<AlunosListaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlunosListaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
