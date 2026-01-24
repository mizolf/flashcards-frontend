import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { CreateDeckRequest, DeckResponse } from '../../models/Deck.dto';
import { DeckService } from '../../services/deck.service';
import { DeckFormDialogComponent } from '../../shared/deck-form-dialog/deck-form-dialog.component';

@Component({
  selector: 'app-my-decks',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterModule, DeckFormDialogComponent],
  templateUrl: './my-decks.component.html',
  styleUrl: './my-decks.component.scss'
})
export class MyDecksComponent implements OnInit {
  showCreateDialog = false;
  openMenuDeckId: number | null = null;
  decks: DeckResponse[] = [];
  loading = false;
  private readonly deckColors = [
    'from-rose-500/90 to-rose-700/90',
    'from-amber-400/90 to-orange-600/90',
    'from-emerald-500/90 to-teal-700/90',
    'from-sky-500/90 to-blue-700/90',
    'from-indigo-500/90 to-violet-700/90',
    'from-fuchsia-500/90 to-pink-700/90',
    'from-lime-500/90 to-green-700/90'
  ];

  constructor(private deckService: DeckService, private router: Router) {}

  ngOnInit(): void {
    this.loadDecks();
  }

  get publicDecks(): DeckResponse[] {
    return this.decks.filter((deck) => deck.isPublic);
  }

  get privateDecks(): DeckResponse[] {
    return this.decks.filter((deck) => !deck.isPublic);
  }

  openCreateDialog(): void {
    this.showCreateDialog = true;
  }

  openManageDeck(deck: DeckResponse, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/decks', deck.id]);
    this.openMenuDeckId = null;
  }

  toggleMenu(deckId: number, event: MouseEvent): void {
    event.stopPropagation();
    this.openMenuDeckId = this.openMenuDeckId === deckId ? null : deckId;
  }

  closeMenu(): void {
    this.openMenuDeckId = null;
  }

  openDeck(deck: DeckResponse): void {
    this.router.navigate(['/decks', deck.id, 'practice']);
  }

  openDetails(deck: DeckResponse, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/decks', deck.id]);
    this.openMenuDeckId = null;
  }

  openAddCards(deck: DeckResponse, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/decks', deck.id], { queryParams: { addCard: '1' } });
    this.openMenuDeckId = null;
  }

  deleteDeck(deck: DeckResponse, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.deckService.deleteDeck(deck.id).subscribe({
      next: () => {
        this.loadDecks();
        this.openMenuDeckId = null;
      },
      error: (err) => {
        console.error('Delete deck failed', err);
      }
    });
  }

  getDeckGradient(deck: DeckResponse, index: number): string {
    const seed = Number.isFinite(deck.id) ? deck.id : index;
    return this.deckColors[seed % this.deckColors.length];
  }

  createOrUpdateDeck(request: CreateDeckRequest): void {
    this.deckService.createDeck(request).subscribe({
      next: () => {
        this.showCreateDialog = false;
        this.loadDecks();
      },
      error: (err) => {
        console.error('Create deck failed', err);
      }
    });
  }

  private loadDecks(): void {
    this.loading = true;
    this.deckService.getDecks().subscribe({
      next: (decks) => {
        this.decks = decks;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
