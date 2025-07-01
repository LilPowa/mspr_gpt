import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  selector: 'app-scan-list',
  templateUrl: './scan-list.component.html',
  styleUrls: ['./scan-list.component.css']
})
export class ScanListComponent implements OnInit {
  scans: any[] = [];
  totalScans: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadApiKeyAndScans(this.currentPage);
  }

  private loadApiKeyAndScans(page: number): void {
    this.http.get<{ apiKey: string }>('http://localhost:3000/api/key/current')
      .subscribe({
        next: (res) => {
          localStorage.setItem('apiKey', res.apiKey);
          this.loadScans(page);
        },
        error: (err) => {
          console.error('Erreur récupération clé API :', err);
        }
      });
  }

  private getApiHeaders(): HttpHeaders {
    const apiKey = localStorage.getItem('apiKey') || '';
    return new HttpHeaders({ 'x-api-key': apiKey });
  }

  loadScans(page: number): void {
    this.http.get<any>(`http://localhost:3000/api/scans/all?page=${page}`, { headers: this.getApiHeaders() }).subscribe({
      next: (response) => {
        this.scans = response.scans;
        this.totalScans = response.total;
        this.currentPage = page;
      },
      error: (err) => {
        console.error('Erreur chargement scans :', err);
      }
    });
  }

  get totalPages(): number[] {
    return Array(Math.ceil(this.totalScans / this.itemsPerPage))
      .fill(0)
      .map((_, i) => i + 1);
  }
}
