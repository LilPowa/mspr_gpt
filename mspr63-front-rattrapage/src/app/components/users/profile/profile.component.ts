import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user = {
    email: '',
    nom: '',
    prenom: ''
  };

  newEmail = '';
  newPassword = '';
  currentPassword = '';
  message = '';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const email = localStorage.getItem('email');
    const nom = localStorage.getItem('nom');
    const prenom = localStorage.getItem('prenom');

    if (email && nom && prenom) {
      this.user.email = email;
      this.user.nom = nom;
      this.user.prenom = prenom;
    } else {
      this.message = 'Aucun utilisateur connecté.';
    }
  }

  updateProfile(): void {
    const updatedUser = {
      email: this.user.email,
      password: this.currentPassword,
      newPassword: this.newPassword
    };

    this.http.put('http://localhost:3000/api/auth/profile', updatedUser)
      .subscribe({
        next: () => {
          this.message = 'Profil mis à jour avec succès';
          this.errorMessage = '';
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Erreur lors de la mise à jour du profil.';
          this.message = '';
        }
      });
  }

  deleteAccount(): void {
    const confirmation = confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.');
    if (!confirmation) return;

    this.http.delete(`http://localhost:3000/api/auth/profile?email=${this.user.email}`)
      .subscribe({
        next: () => {
          localStorage.clear();
          this.router.navigate(['/connexion']);
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Erreur lors de la suppression du compte.';
        }
      });
  }
}
