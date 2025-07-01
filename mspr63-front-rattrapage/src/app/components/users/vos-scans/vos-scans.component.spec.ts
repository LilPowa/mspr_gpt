import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VosScansComponent } from './vos-scans.component';

describe('VosScansComponent', () => {
  let component: VosScansComponent;
  let fixture: ComponentFixture<VosScansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VosScansComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VosScansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
