import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreinoEditarPage } from './treino-editar.page';

describe('TreinoEditarPage', () => {
  let component: TreinoEditarPage;
  let fixture: ComponentFixture<TreinoEditarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TreinoEditarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
