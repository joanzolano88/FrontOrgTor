import { TestBed } from '@angular/core/testing';

import { PaginasService } from './paginas.service';

describe('PaginasService', () => {
  let service: PaginasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaginasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
