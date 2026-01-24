import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';

import { CardResponse, CreateCardRequest } from '../../models/Card.dto';
import { DeckDetailResponse } from '../../models/Deck.dto';
import { CardService } from '../../services/card.service';
import { DeckService } from '../../services/deck.service';
import { CardFormDialogComponent } from '../../shared/card-form-dialog/card-form-dialog.component';

@Component({
  selector: 'app-deck-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    RouterModule,
    CheckboxModule,
    InputTextModule,
    CardFormDialogComponent
  ],
  templateUrl: './deck-detail.component.html',
  styleUrl: './deck-detail.component.scss'
})
export class DeckDetailComponent implements OnInit {
  deck: DeckDetailResponse | null = null;
  cards: CardResponse[] = [];
  loading = false;
  saving = false;
  showCardDialog = false;
  editingCard: CardResponse | null = null;
  deckName = '';
  deckIsPublic = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deckService: DeckService,
    private cardService: CardService
  ) {}

  ngOnInit(): void {
    this.loadDeck();
  }

  openCardDialog(card?: CardResponse): void {
    this.editingCard = card ?? null;
    this.showCardDialog = true;
  }

  saveCard(request: CreateCardRequest): void {
    if (!this.deck) {
      return;
    }

    if (this.editingCard) {
      this.cardService.updateCard(this.deck.id, this.editingCard.id, request).subscribe({
        next: () => {
          this.showCardDialog = false;
          this.editingCard = null;
          this.loadDeck();
        },
        error: (err) => {
          console.error('Update card failed', err);
        }
      });
      return;
    }

    this.cardService.createCard(this.deck.id, request).subscribe({
      next: () => {
        this.showCardDialog = false;
        this.loadDeck();
      },
      error: (err) => {
        console.error('Create card failed', err);
      }
    });
  }

  deleteCard(card: CardResponse): void {
    if (!this.deck) {
      return;
    }

    this.cardService.deleteCard(this.deck.id, card.id).subscribe({
      next: () => {
        this.loadDeck();
      },
      error: (err) => {
        console.error('Delete card failed', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/my-decks']);
  }

  private loadDeck(): void {
    const deckId = Number(this.route.snapshot.paramMap.get('id'));
    if (!deckId) {
      return;
    }

    const openAddCard = this.route.snapshot.queryParamMap.get('addCard') === '1';
    this.loading = true;
    this.deckService.getDeckById(deckId).subscribe({
      next: (deck) => {
        this.deck = deck;
        this.cards = deck.cards;
        this.deckName = deck.name;
        this.deckIsPublic = !!deck.isPublic;
        this.loading = false;
        if (openAddCard) {
          this.openCardDialog();
        }
      },
      error: (err) => {
        console.error('Load deck failed', err);
        this.loading = false;
      }
    });
  }

  saveDeck(): void {
    if (!this.deck) {
      return;
    }
    const trimmedName = this.deckName.trim();
    if (!trimmedName) {
      return;
    }

    this.saving = true;
    this.deckService.updateDeck(this.deck.id, { name: trimmedName, isPublic: this.deckIsPublic }).subscribe({
      next: () => {
        this.saving = false;
        this.loadDeck();
      },
      error: (err) => {
        console.error('Update deck failed', err);
        this.saving = false;
      }
    });
  }
}
