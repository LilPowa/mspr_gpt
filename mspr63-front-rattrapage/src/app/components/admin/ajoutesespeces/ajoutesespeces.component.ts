import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  selector: 'app-ajoutesespeces',
  templateUrl: './ajoutesespeces.component.html',
  styleUrls: ['./ajoutesespeces.component.css'],
})
export class AjoutesespecesComponent {
  especeData = {
    espece: '',
    description: '',
    nomLatin: '',
    famille: '',
    taille: '',
    region: '',
    habitat: '',
    funFact: '',
    image: ''
  };

  familles = ['Mammifères', 'Oiseaux', 'Reptiles', 'Amphibiens', 'Poissons', 'Insectes'];
  message = '';

  private apiKey = '';

  constructor(private http: HttpClient) {
    this.loadApiKey();
  }

  // Charge la clé API depuis le serveur
  private loadApiKey(): void {
    this.http.get<{ apiKey: string }>('http://localhost:3000/api/key/current')
      .subscribe({
        next: (res) => {
          this.apiKey = res.apiKey;
        },
        error: (err) => {
          console.error('Erreur récupération clé API', err);
          this.message = 'Impossible de récupérer la clé API.';
        }
      });
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.especeData.image = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  ajouterEspece(): void {
    if (!this.apiKey) {
      this.message = 'Clé API manquante, impossible d\'ajouter une espèce.';
      return;
    }

    const headers = new HttpHeaders({
      'x-api-key': this.apiKey
    });

    this.http.post('http://localhost:3000/api/especes', this.especeData, { headers })
      .subscribe({
        next: () => {
          this.message = 'Espèce ajoutée avec succès !';
          // Optionnel: réinitialiser le formulaire
          this.especeData = {
            espece: '',
            description: '',
            nomLatin: '',
            famille: '',
            taille: '',
            region: '',
            habitat: '',
            funFact: '',
            image: ''
          };
        },
        error: (err) => {
          this.message = 'Erreur lors de l\'ajout.';
          console.error(err);
        }
      });
  }
}
