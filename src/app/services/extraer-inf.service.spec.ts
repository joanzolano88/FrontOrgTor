import { TestBed } from '@angular/core/testing';

import { ExtraerInfService } from './extraer-inf.service';

describe('ExtraerInfService', () => {
  let service: ExtraerInfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExtraerInfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
