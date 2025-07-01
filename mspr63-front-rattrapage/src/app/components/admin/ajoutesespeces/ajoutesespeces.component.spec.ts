import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutesespecesComponent } from './ajoutesespeces.component';

describe('AjoutesespecesComponent', () => {
  let component: AjoutesespecesComponent;
  let fixture: ComponentFixture<AjoutesespecesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjoutesespecesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjoutesespecesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
