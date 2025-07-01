import { Routes } from '@angular/router';
import { HomeComponent } from './components/lambda/home/home.component';
import { AjoutesespecesComponent } from './components/admin/ajoutesespeces/ajoutesespeces.component';
import { InfoespecesComponent } from './components/admin/infoespeces/infoespeces.component';
import { RegisterComponent } from './components/lambda/register/register.component';
import { LoginComponent } from './components/lambda/login/login.component';
import { ProfileComponent } from './components/users/profile/profile.component';
import { CameraComponent } from './components/users/camera/camera.component';
import { UsersComponent } from './components/admin/users/users.component';
import { ScanListComponent } from './components/admin/scan-list/scan-list.component';

import { AuthGuard } from './guards/auth/auth.guard';
import { AdminGuard } from './guards/admin/admin.guard';
import { VosScansComponent } from './components/users/vos-scans/vos-scans.component';
import { FicheEspeceComponent } from './components/users/fiche-espece/fiche-espece.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'inscription', component: RegisterComponent },
  { path: 'connexion', component: LoginComponent },
  { path: 'fiche-espece/:espece', component: FicheEspeceComponent },

  // USER - nécessite connexion
  { path: 'profil', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'camera', component: CameraComponent, canActivate: [AuthGuard] },
  { path: 'scans', component: VosScansComponent, canActivate: [AuthGuard] },

  // ADMIN - nécessite login admin
  { path: 'ajout', component: AjoutesespecesComponent, canActivate: [AdminGuard] },
  { path: 'view', component: InfoespecesComponent, canActivate: [AdminGuard] },
  { path: 'user', component: UsersComponent, canActivate: [AdminGuard] },
  { path: 'vue-scans', component: ScanListComponent, canActivate: [AdminGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AdminGuard] },
];
