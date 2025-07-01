import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  selector: 'app-infosespeces',
  templateUrl: './infoespeces.component.html',
  styleUrls: ['./infoespeces.component.css']
})
export class InfoespecesComponent implements OnInit {
  especes: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  editId: string | null = null;
  editedEspece: any = {};
  editedImageFile: File | null = null;

  private apiKey = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadApiKey();
  }

  private loadApiKey(): void {
    this.http.get<{ apiKey: string }>('http://localhost:3000/api/key/current').subscribe({
      next: (res) => {
        this.apiKey = res.apiKey;
        this.fetchEspeces();
      },
      error: (err) => {
        console.error('Erreur récupération clé API', err);
        // Optionnel : afficher un message d’erreur à l’utilisateur
      }
    });
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'x-api-key': this.apiKey });
  }

  fetchEspeces(): void {
    if (!this.apiKey) {
      console.error('Clé API manquante, impossible de récupérer les espèces.');
      return;
    }
    this.http.get<any>(`http://localhost:3000/api/especes?page=${this.currentPage}`, { headers: this.getHeaders() }).subscribe(
      res => {
        this.especes = res.data;
        this.totalPages = res.totalPages;
      },
      err => console.error(err)
    );
  }

  changePage(delta: number): void {
    const nextPage = this.currentPage + delta;
    if (nextPage >= 1 && nextPage <= this.totalPages) {
      this.currentPage = nextPage;
      this.fetchEspeces();
    }
  }

  startEdit(espece: any): void {
    this.editId = espece._id;
    this.editedEspece = { ...espece };
    this.editedImageFile = null;
  }

  cancelEdit(): void {
    this.editId = null;
    this.editedEspece = {};
    this.editedImageFile = null;
  }

  handleFileInput(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.editedImageFile = file;
    }
  }

  saveEdit(): void {
    if (!this.apiKey) {
      console.error('Clé API manquante, impossible de modifier l\'espèce.');
      return;
    }
    if (this.editedImageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.editedEspece.image = reader.result;
        this.sendUpdateRequest();
      };
      reader.readAsDataURL(this.editedImageFile);
    } else {
      this.sendUpdateRequest();
    }
  }

  private sendUpdateRequest(): void {
    this.http.put(`http://localhost:3000/api/especes/${this.editId}`, this.editedEspece, { headers: this.getHeaders() }).subscribe(
      () => {
        this.cancelEdit();
        this.fetchEspeces();
      },
      err => console.error(err)
    );
  }

  deleteEspece(id: string): void {
    if (!this.apiKey) {
      console.error('Clé API manquante, impossible de supprimer l\'espèce.');
      return;
    }
    if (confirm('Supprimer cette espèce ?')) {
      this.http.delete(`http://localhost:3000/api/especes/${id}`, { headers: this.getHeaders() }).subscribe(
        () => this.fetchEspeces(),
        err => console.error(err)
      );
    }
  }
}
