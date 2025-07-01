import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheEspeceComponent } from './fiche-espece.component';

describe('FicheEspeceComponent', () => {
  let component: FicheEspeceComponent;
  let fixture: ComponentFixture<FicheEspeceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FicheEspeceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheEspeceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
