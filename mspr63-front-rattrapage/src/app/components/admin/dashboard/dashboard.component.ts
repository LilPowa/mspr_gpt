import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  stats = {
    today: 0,
    week: 0,
    month: 0,
    year: 0,
    users: 0,
    avgExecutionTime: '0.00',
    avgConfidence: '0.00'
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchStats();
  }

  ngAfterViewInit(): void {
    this.renderSpeciesChart();
    this.renderExecutionChart();
  }

  fetchStats() {
    this.http.get<any>('http://localhost:3000/api/dashboard/stats').subscribe({
      next: data => {
        this.stats = { ...this.stats, ...data };
      },
      error: err => console.error('Erreur fetchStats():', err)
    });
  }

  renderSpeciesChart() {
    this.http.get<any>('http://localhost:3000/api/dashboard/species-distribution').subscribe({
      next: data => {
        const ctx = document.getElementById('speciesChart') as HTMLCanvasElement;
        if (!ctx) return;

        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.labels,
            datasets: [{
              label: 'Scans par espèce',
              data: data.counts,
              backgroundColor: '#4caf50',
              borderRadius: 5
            }]
          },
          options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
          }
        });
      },
      error: err => console.error('Erreur fetchSpeciesChart():', err)
    });
  }

  renderExecutionChart() {
    this.http.get<any>('http://localhost:3000/api/dashboard/execution-evolution').subscribe({
      next: data => {
        const ctx = document.getElementById('executionChart') as HTMLCanvasElement;
        if (!ctx) return;

        new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.labels,
            datasets: [{
              label: 'Temps d\'exécution (ms)',
              data: data.values,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Temps (millisecondes)'
                }
              },
              x: {
                ticks: {
                  maxRotation: 90,
                  minRotation: 45,
                  autoSkip: true,
                  maxTicksLimit: 15
                }
              }
            }
          }
        });
      },
      error: err => console.error('Erreur fetchExecutionChart():', err)
    });
  }
}
