import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeProfessorPage } from './home-professor.page';

describe('HomeProfessorPage', () => {
  let component: HomeProfessorPage;
  let fixture: ComponentFixture<HomeProfessorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeProfessorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
