import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarPartidoPage } from './agregar-partido.page';

describe('AgregarPartidoPage', () => {
  let component: AgregarPartidoPage;
  let fixture: ComponentFixture<AgregarPartidoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AgregarPartidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
