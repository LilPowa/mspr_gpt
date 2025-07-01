import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  message = '';
  apiKey = '';

  private adminEmail = 'WildLens';
  private adminPassword = 'Wild@Lens/2025'; 

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get<{ apiKey: string }>('http://localhost:3000/api/key/current').subscribe({
      next: res => this.apiKey = res.apiKey,
      error: err => console.error('Erreur lors de la récupération de la clé API :', err)
    });
  }

  login() {
    localStorage.removeItem('admin');

    if (this.email === this.adminEmail && this.password === this.adminPassword) {
      localStorage.setItem('admin', 'true'); 
      this.router.navigate(['/dashboard']);  
      return;
    }

    if (!this.apiKey) {
      this.message = 'Clé API non chargée. Veuillez réessayer dans un instant.';
      return;
    }

    const user = {
      email: this.email,
      password: this.password
    };

    const headers = new HttpHeaders({
      'x-api-key': this.apiKey
    });

    this.http.post<{ message: string, nom: string, prenom: string, email: string }>(
      'http://localhost:3000/api/auth/login',
      user,
      { headers }
    ).subscribe({
      next: (response) => {
        localStorage.setItem('token', 'true');
        localStorage.setItem('nom', response.nom);
        localStorage.setItem('prenom', response.prenom);
        localStorage.setItem('email', response.email);

        this.router.navigate(['/profil']);
      },
      error: (err) => {
        this.message = err.error.message || 'Erreur lors de la connexion';
      }
    });
  }
}
