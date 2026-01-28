import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { CardResponse } from '../../models/Card.dto';
import { DeckDetailResponse } from '../../models/Deck.dto';
import { DeckService } from '../../services/deck.service';
import { UI_TEXT } from '../../constants/ui-text';

@Component({
  selector: 'app-deck-practice',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule],
  templateUrl: './deck-practice.component.html',
  styleUrl: './deck-practice.component.scss'
})
export class DeckPracticeComponent implements OnInit {
  /** Static UI copy for the template. */
  readonly text = UI_TEXT;
  /** Loaded deck with cards for practice. */
  deck: DeckDetailResponse | null = null;
  /** Full card list from the deck. */
  cards: CardResponse[] = [];
  /** Cards after tag/difficulty filters. */
  filteredCards: CardResponse[] = [];
  /** Cards actually displayed (filtered + ordered). */
  displayCards: CardResponse[] = [];
  /** True while initial load is running. */
  initialLoading = true;
  /** True when answer side is visible. */
  showAnswer = false;
  /** Index of the current card in displayCards. */
  index = 0;
  /** Unique tags computed from the deck cards. */
  availableTags: string[] = [];
  /** Selected tag filter (null = all). */
  selectedTag: string | null = null;
  /** Selected difficulty filter (null = all). */
  selectedDifficulty: number | null = null;
  /** Whether the current order is randomized. */
  randomOrder = false;

  /** Provides routing and deck access for practice mode. */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deckService: DeckService
  ) {}

  /** Loads the deck on first render. */
  ngOnInit(): void {
    this.loadDeck();
  }

  /** Current card based on the active index. */
  get currentCard(): CardResponse | null {
    return this.displayCards[this.index] ?? null;
  }

  /** Toggles answer visibility for the current card. */
  toggleAnswer(): void {
    this.showAnswer = !this.showAnswer;
  }

  /** Advances to the next card in the current list. */
  nextCard(): void {
    if (this.index < this.displayCards.length - 1) {
      this.index += 1;
      this.showAnswer = false;
    }
  }

  /** Moves back to the previous card in the current list. */
  prevCard(): void {
    if (this.index > 0) {
      this.index -= 1;
      this.showAnswer = false;
    }
  }

  /** Resets the practice session to the first card. */
  restart(): void {
    this.index = 0;
    this.showAnswer = false;
  }

  /** Toggles random order and reapplies filters. */
  toggleRandomOrder(): void {
    this.randomOrder = !this.randomOrder;
    this.applyFilters(true);
  }

  /** Shuffles the current filtered list and restarts the session. */
  shuffleNow(): void {
    this.randomOrder = true;
    this.displayCards = this.shuffleCards(this.filteredCards);
    this.index = 0;
    this.showAnswer = false;
  }

  /** Applies tag/difficulty filters when the UI changes. */
  onFiltersChange(): void {
    this.applyFilters(true);
  }

  /** Navigates back to My Decks. */
  exit(): void {
    const origin = this.route.snapshot.queryParamMap.get('origin');
    if (origin === 'home') {
      this.router.navigate(['/home']);
      return;
    }
    if (origin === 'my-decks') {
      this.router.navigate(['/my-decks']);
      return;
    }
    this.router.navigate(['/my-decks']);
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
   * Loads deck data and initializes filters and ordering.
   * @remarks Uses the route param id to fetch the deck.
   */
  private loadDeck(): void {
    const deckId = Number(this.route.snapshot.paramMap.get('id'));
    if (!deckId) {
      return;
    }

    const quickMode = this.route.snapshot.queryParamMap.get('quick') === '1';
    this.initialLoading = true;
    this.deckService.getDeckById(deckId).subscribe({
      next: (deck) => {
        this.deck = deck;
        this.cards = deck.cards ?? [];
        this.randomOrder = quickMode;
        this.updateAvailableTags(this.cards);
        this.applyFilters(true);
        this.initialLoading = false;
        this.index = 0;
        this.showAnswer = false;
      },
      error: (err) => {
        console.error('Load deck failed', err);
        this.initialLoading = false;
      }
    });
  }

  /**
   * Filters cards by tag/difficulty and applies ordering.
   * @param resetIndex When true, resets the current index to the first card.
   */
  private applyFilters(resetIndex: boolean): void {
    const filtered = this.cards.filter((card) => {
      if (this.selectedTag) {
        if (this.selectedTag === this.text.deckPractice.generalTag) {
          if (card.tag) {
            return false;
          }
        } else if (card.tag !== this.selectedTag) {
          return false;
        }
      }

      if (this.selectedDifficulty && card.difficulty !== this.selectedDifficulty) {
        return false;
      }

      return true;
    });

    this.filteredCards = filtered;
    this.displayCards = this.randomOrder ? this.shuffleCards(filtered) : filtered;

    if (resetIndex || this.index >= this.displayCards.length) {
      this.index = 0;
      this.showAnswer = false;
    }
  }

  /**
   * Shuffles a list using Fisher-Yates.
   * @param cards Cards to shuffle.
   */
  private shuffleCards(cards: CardResponse[]): CardResponse[] {
    const next = [...cards];
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
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
      tags.unshift(this.text.deckPractice.generalTag);
    }
    this.availableTags = tags;

    if (this.selectedTag && !this.availableTags.includes(this.selectedTag)) {
      this.selectedTag = null;
    }
  }
}
