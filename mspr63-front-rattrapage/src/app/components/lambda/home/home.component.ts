import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  especes: any[] = [];
  currentIndex: number = 0;
  private apiKey = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadApiKey();
    setInterval(() => {
      if (this.especes.length > 0) {
        this.currentIndex = (this.currentIndex + 1) % this.especes.length;
      }
    }, 5000); // défilement automatique toutes les 5 secondes
  }

  private loadApiKey(): void {
    this.http.get<{ apiKey: string }>('http://localhost:3000/api/key/current').subscribe({
      next: (res) => {
        this.apiKey = res.apiKey;
        this.loadEspeces();
      },
      error: (err) => {
        console.error('Erreur récupération clé API', err);
      }
    });
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'x-api-key': this.apiKey });
  }

  loadEspeces(): void {
    if (!this.apiKey) {
      console.error('Clé API manquante, impossible de charger les espèces.');
      return;
    }
    this.http.get<any>('http://localhost:3000/api/especes/all', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => this.especes = data,
        error: (err) => console.error('Erreur chargement espèces :', err)
      });
  }

  goToFiche(espece: string): void {
    this.router.navigate(['/fiche-espece', espece]);
  }
}
