import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { CrudService } from '../crud.service';
import { TipoUsuario } from 'src/enums/TipoUsuario';
import { SesionService } from './sesion.service';

describe('SesionService', () => {
  let service: SesionService;
  let crudService: jasmine.SpyObj<CrudService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    crudService = jasmine.createSpyObj('CrudService', ['verSesion', 'obtenerUsuario', 'cerrarSesion']);
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      providers: [
        SesionService,
        { provide: CrudService, useValue: crudService },
        { provide: Router, useValue: router }
      ]
    });

    service = TestBed.inject(SesionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should allow activation when the session exists', () => {
    crudService.verSesion.and.returnValue(true);

    expect(service.canActivate()).toBeTrue();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should deny access and redirect to login when the session is missing', () => {
    crudService.verSesion.and.returnValue(false);

    expect(service.canActivate()).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });

  it('should validate only organizer users', () => {
    crudService.obtenerUsuario.and.returnValue({ id: 1, tipoUsuario: TipoUsuario.ORGANIZADOR } as any);
    expect(service.validacionOrganizador()).toBeTrue();

    crudService.obtenerUsuario.and.returnValue({ id: 2, tipoUsuario: TipoUsuario.JUGADOR } as any);
    expect(service.validacionOrganizador()).toBeFalse();
  });
});
