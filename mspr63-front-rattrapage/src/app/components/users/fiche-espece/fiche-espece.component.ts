import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  selector: 'app-fiche-espece',
  templateUrl: './fiche-espece.component.html',
  styleUrls: ['./fiche-espece.component.css']
})
export class FicheEspeceComponent implements OnInit {
  espece: any = null;
  especeName: string = '';
  private apiKey = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadApiKey();
  }

  private loadApiKey(): void {
    this.http.get<{ apiKey: string }>('http://localhost:3000/api/key/current').subscribe({
      next: res => {
        this.apiKey = res.apiKey;
        this.route.paramMap.subscribe(params => {
          this.especeName = params.get('espece') || '';
          if (this.especeName) {
            this.loadDetails();
          }
        });
      },
      error: err => {
        console.error('Erreur récupération clé API', err);
      }
    });
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'x-api-key': this.apiKey });
  }

  loadDetails(): void {
    if (!this.apiKey) {
      console.error('Clé API manquante, impossible de charger l\'espèce.');
      return;
    }

    this.http.get(`http://localhost:3000/api/especes/nom/${encodeURIComponent(this.especeName)}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: data => this.espece = data,
      error: err => {
        console.error('Erreur chargement espèce :', err);
        this.espece = null;
      }
    });
  }
}
