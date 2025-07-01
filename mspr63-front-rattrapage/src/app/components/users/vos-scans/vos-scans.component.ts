import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  selector: 'app-vos-scans',
  templateUrl: './vos-scans.component.html',
  styleUrls: ['./vos-scans.component.css']
})
export class VosScansComponent implements OnInit {
  scans: any[] = [];
  especes: string[] = [];
  selectedEspece: string = '';
  page = 1;
  totalPages = 1;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadApiKeyAndData();
  }

  private loadApiKeyAndData(): void {
    this.http.get<{ apiKey: string }>('http://localhost:3000/api/key/current')
      .subscribe({
        next: (res) => {
          localStorage.setItem('apiKey', res.apiKey);
          this.loadEspeces();
          this.fetchScans();
        },
        error: (err) => {
          console.error('Erreur récupération clé API :', err);
        }
      });
  }

  private getApiHeaders(): HttpHeaders {
    const apiKey = localStorage.getItem('apiKey') || '';
    return new HttpHeaders({
      'x-api-key': apiKey
    });
  }

  loadEspeces(): void {
    this.http.get<any[]>('http://localhost:3000/api/especes/all', { headers: this.getApiHeaders() })
      .subscribe({
        next: data => {
          this.especes = data.map(e => e.espece);
        },
        error: err => console.error('Erreur chargement espèces :', err)
      });
  }

  fetchScans(): void {
    const email = localStorage.getItem('email');
    if (!email) return;

    let url = `http://localhost:3000/api/scans/myscans?email=${email}&page=${this.page}`;
    if (this.selectedEspece) {
      url += `&espece=${encodeURIComponent(this.selectedEspece)}`;
    }

    this.http.get<any>(url, { headers: this.getApiHeaders() })
      .subscribe({
        next: (res) => {
          this.scans = res.scans;
          this.totalPages = res.totalPages;
        },
        error: (err) => console.error('Erreur chargement scans :', err)
      });
  }

  changePage(delta: number): void {
    if (this.page + delta < 1 || this.page + delta > this.totalPages) return;
    this.page += delta;
    this.fetchScans();
  }

  onEspeceChange(): void {
    const email = localStorage.getItem('email');
    if (!email) return;

    let url = `http://localhost:3000/api/scans/all?email=${encodeURIComponent(email)}`;

    if (this.selectedEspece && this.selectedEspece !== 'Toutes') {
      url += `&espece=${encodeURIComponent(this.selectedEspece)}`;
    }

    this.http.get<any>(url, { headers: this.getApiHeaders() }).subscribe({
      next: res => {
        this.scans = res.scans;
      },
      error: err => {
        console.error('Erreur lors du filtrage par espèce :', err);
      }
    });
  }
}
