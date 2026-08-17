import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanchasPage } from './canchas.page';

describe('CanchasPage', () => {
  let component: CanchasPage;
  let fixture: ComponentFixture<CanchasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CanchasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
