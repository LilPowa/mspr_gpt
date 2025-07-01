import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  dbConnectionFailed = false;

  get isAdmin(): boolean {
    return localStorage.getItem('admin') === 'true';
  }

  get isUser(): boolean {
    return localStorage.getItem('token') === 'true' && !this.isAdmin;
  }

  get isLoggedIn(): boolean {
    return this.isUser || this.isAdmin;
  }

  constructor(private router: Router, private http: HttpClient) {
    this.checkApiConnection();
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }

  checkApiConnection() {
    // Exemple d’appel vers une route API simple
    this.http.get('http://localhost:3000/api/key/current').subscribe({
      next: () => {
        this.dbConnectionFailed = false;
      },
      error: () => {
        this.dbConnectionFailed = true;
      }
    });
  }
}