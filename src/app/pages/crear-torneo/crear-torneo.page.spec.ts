import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearTorneoPage } from './crear-torneo.page';

describe('CrearTorneoPage', () => {
  let component: CrearTorneoPage;
  let fixture: ComponentFixture<CrearTorneoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CrearTorneoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
