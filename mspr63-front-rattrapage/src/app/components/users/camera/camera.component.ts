import {
  Component, OnInit, AfterViewInit, ViewChild, ElementRef
} from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnInit, AfterViewInit {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;

  canvasElement!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  photoUrl: string | null = null;
  analyses: any[] = [];
  email: string = '';
  private apiKey: string = '';
  loading: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.canvasElement = document.createElement('canvas');
    this.context = this.canvasElement.getContext('2d')!;
    this.email = localStorage.getItem('email') || '';
    this.loadApiKey();
  }

  ngAfterViewInit(): void {
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
    if (!isSecure) {
      alert("La caméra nécessite une connexion HTTPS ou localhost.");
      return;
    }
    this.startCamera();
  }

  private loadApiKey(): void {
    this.http.get<{ apiKey: string }>('http://localhost:3000/api/key/current')
      .subscribe({
        next: res => this.apiKey = res.apiKey,
        error: err => {
          console.error('Erreur récupération clé API :', err);
          alert("Impossible de récupérer la clé API.");
        }
      });
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'x-api-key': this.apiKey });
  }

  startCamera(): void {
    const video = this.videoRef?.nativeElement;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        video.srcObject = stream;
        video.onloadedmetadata = () => video.play().catch(console.error);
      })
      .catch(err => {
        console.error('Erreur accès caméra :', err);
        alert("Erreur accès caméra : " + err.message);
      });
  }

  stopCamera(): void {
    const stream = this.videoRef?.nativeElement?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    this.videoRef.nativeElement.srcObject = null;
  }

  capturePhoto(): void {
    const video = this.videoRef.nativeElement;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    this.canvasElement.width = width;
    this.canvasElement.height = height;
    this.context.drawImage(video, 0, 0, width, height);
    this.photoUrl = this.canvasElement.toDataURL('image/png');

    this.loading = true;
    this.classifyPhoto(this.photoUrl);
  }

  classifyPhoto(photo: string): void {
    if (!this.apiKey) {
      alert("Impossible de classifier sans clé API.");
      this.loading = false;
      return;
    }

    this.http.post<any>('http://localhost:3000/api/especes/classify', {
      photo,
      email: this.email
    }, { headers: this.getHeaders() }).subscribe({
      next: res => {
        const { match, data, predicted_species, confidence, execution_time } = res;

        const analysis = match ? {
          photo,
          species: `${data.espece} (${confidence?.toFixed(1)}%)`,
          description: data.description,
          nomLatin: data.nomLatin,
          famille: data.famille,
          taille: data.taille,
          region: data.region,
          habitat: data.habitat,
          funFact: data.funFact,
          image: data.image,
          executionTime: execution_time
        } : {
          photo,
          species: `Espèce inconnue (${predicted_species}, ${confidence?.toFixed(1) || '?' }%)`,
          description: 'Espèce non reconnue dans notre base de données.',
          executionTime: execution_time
        };

        this.analyses.unshift(analysis);
      },
      error: err => console.error('Erreur classification :', err),
      complete: () => {
        this.loading = false;
      }
    });
  }

  removePhoto(): void {
    this.photoUrl = null;
    this.analyses = [];
    this.startCamera();
  }
}
