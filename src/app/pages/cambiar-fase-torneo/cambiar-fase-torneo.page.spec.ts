import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CambiarFaseTorneoPage } from './cambiar-fase-torneo.page';

describe('CambiarFaseTorneoPage', () => {
  let component: CambiarFaseTorneoPage;
  let fixture: ComponentFixture<CambiarFaseTorneoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CambiarFaseTorneoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
