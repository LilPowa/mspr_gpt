import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoespecesComponent } from './infoespeces.component';

describe('InfoespecesComponent', () => {
  let component: InfoespecesComponent;
  let fixture: ComponentFixture<InfoespecesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoespecesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoespecesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
