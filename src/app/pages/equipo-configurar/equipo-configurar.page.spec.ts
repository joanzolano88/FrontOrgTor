import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EquipoConfigurarPage } from './EquipoConfigurarPage';

describe('EquipoConfigurarPage', () => {
  let component: EquipoConfigurarPage;
  let fixture: ComponentFixture<EquipoConfigurarPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EquipoConfigurarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
