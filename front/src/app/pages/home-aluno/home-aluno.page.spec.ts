import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeAlunoPage } from './home-aluno.page';

describe('HomeAlunoPage', () => {
  let component: HomeAlunoPage;
  let fixture: ComponentFixture<HomeAlunoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeAlunoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
