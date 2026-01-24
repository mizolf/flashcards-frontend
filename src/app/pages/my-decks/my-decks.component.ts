import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { CreateDeckRequest, DeckResponse } from '../../models/Deck.dto';
import { DeckService } from '../../services/deck.service';
import { DeckFormDialogComponent } from '../../shared/deck-form-dialog/deck-form-dialog.component';

@Component({
  selector: 'app-my-decks',
  standalone: true,
  imports: [CommonModule, ButtonModule, DeckFormDialogComponent],
  templateUrl: './my-decks.component.html',
  styleUrl: './my-decks.component.scss'
})
export class MyDecksComponent implements OnInit {
  showCreateDialog = false;
  decks: DeckResponse[] = [];
  loading = false;

  constructor(private deckService: DeckService) {}

  ngOnInit(): void {
    this.loadDecks();
  }

  openCreateDialog(): void {
    this.showCreateDialog = true;
  }

  createDeck(request: CreateDeckRequest): void {
    console.log('MyDecksComponent.createDeck: request', request);
    this.deckService.createDeck(request).subscribe({
      next: () => {
        this.showCreateDialog = false;
        // Response is empty; re-fetch from server.
       // this.loadDecks();
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
