import { TestBed } from '@angular/core/testing';

import { FormCheckService } from './form-check.service';

describe('FormCheckService', () => {
  let service: FormCheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormCheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
