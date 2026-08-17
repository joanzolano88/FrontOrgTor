import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaPartidosPage } from './lista-partidos.page';

describe('ListaPartidosPage', () => {
  let component: ListaPartidosPage;
  let fixture: ComponentFixture<ListaPartidosPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ListaPartidosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
