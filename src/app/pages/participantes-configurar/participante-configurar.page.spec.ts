import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParticipanteConfigurarPage } from './participante-configurar.page';

describe('ParticipantesConfigurarPage', () => {
  let component: ParticipanteConfigurarPage;
  let fixture: ComponentFixture<ParticipanteConfigurarPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ParticipanteConfigurarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
