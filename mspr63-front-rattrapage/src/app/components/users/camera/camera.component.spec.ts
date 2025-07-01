import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CameraComponent } from './camera.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';

describe('CameraComponent', () => {
  let component: CameraComponent;
  let fixture: ComponentFixture<CameraComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CameraComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // Mock video element (avec méthodes et propriétés utilisées)
    const videoElement = document.createElement('video');
    spyOn(videoElement, 'play').and.returnValue(Promise.resolve());
    spyOnProperty(videoElement, 'videoWidth').and.returnValue(640);
    spyOnProperty(videoElement, 'videoHeight').and.returnValue(480);

    component.videoRef = new ElementRef(videoElement);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create component and initialize email from localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue('test@example.com');
    component.ngOnInit();
    expect(component.email).toBe('test@example.com');
    expect(component.canvasElement).toBeTruthy();
    expect(component.context).toBeTruthy();
  });

  it('should call startCamera on ngAfterViewInit if secure or localhost', () => {
    spyOn(component, 'startCamera');
    spyOnProperty(location, 'hostname').and.returnValue('localhost');
    spyOnProperty(location, 'protocol').and.returnValue('http:');

    component.ngAfterViewInit();
    expect(component.startCamera).toHaveBeenCalled();
  });

  it('should alert and NOT call startCamera if not secure and not localhost', () => {
    spyOn(window, 'alert');
    spyOn(component, 'startCamera');
    spyOnProperty(location, 'hostname').and.returnValue('example.com');
    spyOnProperty(location, 'protocol').and.returnValue('http:');

    component.ngAfterViewInit();
    expect(window.alert).toHaveBeenCalledWith('La caméra nécessite une connexion HTTPS ou localhost.');
    expect(component.startCamera).not.toHaveBeenCalled();
  });

  it('should capture photo and call showRandomSpecies', () => {
    spyOn(component.context, 'drawImage').and.callThrough();
    spyOn(component, 'showRandomSpecies');

    component.capturePhoto();

    expect(component.context.drawImage).toHaveBeenCalled();
    expect(component.photoUrl).toContain('data:image/png;base64');
  });

  it('should call showRandomSpecies and process HTTP response for known species', fakeAsync(() => {
    const photo = 'fakePhotoBase64';

    component.email = 'test@example.com';

    component.showRandomSpecies(photo);

    // Requête POST classification
    const req1 = httpMock.expectOne('http://localhost:3000/api/especes/classify');
    expect(req1.request.method).toBe('POST');
    expect(req1.request.body.photo).toBe(photo);

    // Répondre avec un match
    req1.flush({
      match: true,
      data: {
        espece: 'Chat',
        description: 'Un chat domestique',
        nomLatin: 'Felis catus',
        famille: 'Felidae',
        taille: '40 cm',
        region: 'Monde',
        habitat: 'Maison',
        funFact: 'Les chats ronronnent',
        image: 'url_image_chat'
      }
    });

    tick();

    expect(component.analyses.length).toBe(1);
    expect(component.analyses[0].species).toBe('Chat');

    // Requête POST sauvegarde scan
    const req2 = httpMock.expectOne('http://localhost:3000/api/scans/userscan');
    expect(req2.request.method).toBe('POST');
    expect(req2.request.body.email).toBe('test@example.com');

    req2.flush({ success: true });
  }));

  it('should handle unknown species response in showRandomSpecies', fakeAsync(() => {
    const photo = 'fakePhotoBase64';

    component.showRandomSpecies(photo);

    const req = httpMock.expectOne('http://localhost:3000/api/especes/classify');
    req.flush({
      match: false,
      predicted_species: 'InconnueXYZ'
    });

    tick();

    expect(component.analyses.length).toBe(1);
    expect(component.analyses[0].species).toContain('Espèce inconnue');
  }));

  it('should clear photo and analyses on removePhoto and restart camera', () => {
    spyOn(component, 'startCamera');
    component.photoUrl = 'somePhoto';
    component.analyses = [{ species: 'Chat' }];

    component.removePhoto();

    expect(component.photoUrl).toBeNull();
    expect(component.analyses.length).toBe(0);
    expect(component.startCamera).toHaveBeenCalled();
  });
});
