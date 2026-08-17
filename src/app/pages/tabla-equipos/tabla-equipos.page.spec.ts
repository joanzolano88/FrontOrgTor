import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TablaEquiposPage } from './tabla-equipos.page';

describe('TablaEquiposPage', () => {
  let component: TablaEquiposPage;
  let fixture: ComponentFixture<TablaEquiposPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TablaEquiposPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
