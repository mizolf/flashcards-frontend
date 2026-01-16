import { Routes } from '@angular/router';

import { authGuard } from './authentication/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { MyDecksComponent } from './pages/my-decks/my-decks.component';
import { DeckDetailComponent } from './pages/deck-detail/deck-detail.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';


export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
        { path: 'home', component: HomeComponent },
        { path: 'my-decks', component: MyDecksComponent },
        { path: 'decks/:id', component: DeckDetailComponent },
        { path: 'profile', component: ProfileComponent },
        { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    },
    { path: '**', component: NotFoundComponent },
];
