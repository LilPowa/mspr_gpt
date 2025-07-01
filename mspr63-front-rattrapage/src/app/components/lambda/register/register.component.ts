import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  nom = '';
  prenom = '';
  email = '';
  password = '';
  message = '';
  apiKey = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<{ apiKey: string }>('http://localhost:3000/api/key/current').subscribe({
      next: res => this.apiKey = res.apiKey,
      error: err => console.error('Erreur lors de la récupération de la clé API :', err)
    });
  }

  register() {
    if (!this.apiKey) {
      this.message = 'Clé API non chargée. Réessayez dans un instant.';
      return;
    }

    const user = {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      password: this.password
    };

    const headers = new HttpHeaders({
      'x-api-key': this.apiKey
    });

    this.http.post('http://localhost:3000/api/auth/register', user, { headers }).subscribe({
      next: () => this.message = 'Inscription réussie !',
      error: err => this.message = err.error?.message || 'Erreur lors de l\'inscription.'
    });
  }
}
