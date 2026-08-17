import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanchaPage } from './cancha.page';

describe('CanchaPage', () => {
  let component: CanchaPage;
  let fixture: ComponentFixture<CanchaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CanchaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
