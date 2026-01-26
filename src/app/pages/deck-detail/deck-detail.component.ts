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
import { UI_TEXT } from '../../constants/ui-text';

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
  /** Static UI copy for the template. */
  readonly text = UI_TEXT;
  /** Loaded deck with full card list. */
  deck: DeckDetailResponse | null = null;
  /** Local card list for rendering and filtering. */
  cards: CardResponse[] = [];
  /** True while initial load is running. */
  initialLoading = true;
  /** True while a refresh is running. */
  refreshing = false;
  /** True while deck save request is running. */
  saving = false;
  /** True while card save request is running. */
  cardSaving = false;
  /** True while card delete request is running. */
  cardDeleting = false;
  /** Controls the card form dialog visibility. */
  showCardDialog = false;
  /** Card currently being edited in the dialog. */
  editingCard: CardResponse | null = null;
  /** Controls the delete confirmation dialog visibility. */
  showDeleteDialog = false;
  /** Card pending deletion in the confirm dialog. */
  pendingDeleteCard: CardResponse | null = null;
  /** Editable deck name bound to the form. */
  deckName = '';
  /** Editable public/private flag bound to the form. */
  deckIsPublic = false;
  /** Unique tags computed from the deck cards. */
  availableTags: string[] = [];
  /** Currently selected tag filter. */
  selectedTag: string | null = null;

  /** Provides routing and deck/card services for the detail view. */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deckService: DeckService,
    private cardService: CardService
  ) {}

  /** Loads the deck on first render. */
  ngOnInit(): void {
    this.loadDeck(true);
  }

  /**
   * Opens the card dialog in create or edit mode.
   * @param card Optional card to edit.
   */
  openCardDialog(card?: CardResponse): void {
    this.editingCard = card ?? null;
    this.showCardDialog = true;
  }

  /**
   * Creates or updates a card, then refreshes the deck.
   * @param request Card payload.
   */
  saveCard(request: CreateCardRequest): void {
    if (!this.deck) {
      return;
    }
    if (this.cardSaving) {
      return;
    }

    this.cardSaving = true;

    if (this.editingCard) {
      this.cardService.updateCard(this.deck.id, this.editingCard.id, request).subscribe({
        next: () => {
          this.showCardDialog = false;
          this.editingCard = null;
          this.cardSaving = false;
          this.loadDeck(false);
        },
        error: (err) => {
          console.error('Update card failed', err);
          this.cardSaving = false;
        }
      });
      return;
    }

    this.cardService.createCard(this.deck.id, request).subscribe({
      next: () => {
        this.showCardDialog = false;
        this.cardSaving = false;
        this.loadDeck(false);
      },
      error: (err) => {
        console.error('Create card failed', err);
        this.cardSaving = false;
      }
    });
  }

  /**
   * Opens the delete confirmation dialog for a card.
   * @param card Card to delete.
   */
  deleteCard(card: CardResponse): void {
    this.pendingDeleteCard = card;
    this.showDeleteDialog = true;
  }

  /**
   * Toggles the tag filter selection.
   * @param tag Selected tag (null clears selection).
   */
  selectTag(tag: string | null): void {
    if (this.selectedTag === tag) {
      this.selectedTag = null;
      return;
    }
    this.selectedTag = tag;
  }

  /** Returns cards filtered by the selected tag. */
  get filteredCards(): CardResponse[] {
    if (!this.selectedTag) {
      return this.cards;
    }
    if (this.selectedTag === this.text.deckDetail.generalTag) {
      return this.cards.filter((card) => !card.tag);
    }
    return this.cards.filter((card) => card.tag === this.selectedTag);
  }

  /** Navigates back to the My Decks screen. */
  goBack(): void {
    this.router.navigate(['/my-decks']);
  }

  /**
   * Loads deck details and updates view state.
   * @param showLoader When true, shows the initial loader instead of refresh state.
   */
  private loadDeck(showLoader = true): void {
    const deckId = Number(this.route.snapshot.paramMap.get('id'));
    if (!deckId) {
      return;
    }

    const openAddCard = this.route.snapshot.queryParamMap.get('addCard') === '1';
    if (showLoader) {
      this.initialLoading = true;
    } else {
      this.refreshing = true;
    }
    this.deckService.getDeckById(deckId).subscribe({
      next: (deck) => {
        this.deck = deck;
        this.cards = deck.cards;
        this.deckName = deck.name;
        this.deckIsPublic = !!deck.isPublic;
        this.updateAvailableTags(deck.cards);
        this.initialLoading = false;
        this.refreshing = false;
        if (openAddCard) {
          this.openCardDialog();
        }
      },
      error: (err) => {
        console.error('Load deck failed', err);
        this.initialLoading = false;
        this.refreshing = false;
      }
    });
  }

  /**
   * Saves the deck settings and refreshes on success.
   * @remarks Uses the current form state for the payload.
   */
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
        this.loadDeck(false);
      },
      error: (err) => {
        console.error('Update deck failed', err);
        this.saving = false;
      }
    });
  }

  /** Cancels the delete dialog if a delete is not in progress. */
  cancelDeleteCard(): void {
    if (this.cardDeleting) {
      return;
    }
    this.showDeleteDialog = false;
    this.pendingDeleteCard = null;
  }

  /** Confirms card deletion and refreshes the deck. */
  confirmDeleteCard(): void {
    if (!this.deck || !this.pendingDeleteCard || this.cardDeleting) {
      return;
    }
    this.cardDeleting = true;
    this.cardService.deleteCard(this.deck.id, this.pendingDeleteCard.id).subscribe({
      next: () => {
        this.cardDeleting = false;
        this.showDeleteDialog = false;
        this.pendingDeleteCard = null;
        this.loadDeck(false);
      },
      error: (err) => {
        console.error('Delete card failed', err);
        this.cardDeleting = false;
      }
    });
  }

  /**
   * Maps numeric difficulty to display label.
   * @param difficulty Numeric difficulty value.
   */
  getDifficultyLabel(difficulty?: number | null): string {
    if (difficulty === 1) {
      return 'LOW';
    }
    if (difficulty === 2) {
      return 'MEDIUM';
    }
    if (difficulty === 3) {
      return 'HARD';
    }
    return 'N/A';
  }

  /**
   * Returns a border class based on card difficulty.
   * @param difficulty Numeric difficulty value.
   */
  getDifficultyBorderClass(difficulty?: number | null): string {
    if (difficulty === 1) {
      return 'border-emerald-300';
    }
    if (difficulty === 2) {
      return 'border-amber-300';
    }
    if (difficulty === 3) {
      return 'border-rose-300';
    }
    return 'border-border';
  }

  /**
   * Builds the tag list and keeps the selection valid.
   * @param cards Cards used to derive unique tags.
   */
  private updateAvailableTags(cards: CardResponse[]): void {
    const next = new Set<string>();
    let hasUntagged = false;

    cards.forEach((card) => {
      const tag = card.tag?.trim();
      if (tag) {
        next.add(tag);
      } else {
        hasUntagged = true;
      }
    });

    const tags = Array.from(next).sort((a, b) => a.localeCompare(b));
    if (hasUntagged) {
      tags.unshift(this.text.deckDetail.generalTag);
    }

    this.availableTags = tags;
    if (this.selectedTag && !this.availableTags.includes(this.selectedTag)) {
      this.selectedTag = null;
    }
  }
}
