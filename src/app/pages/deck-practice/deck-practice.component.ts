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
  readonly text = UI_TEXT;
  deck: DeckDetailResponse | null = null;
  cards: CardResponse[] = [];
  filteredCards: CardResponse[] = [];
  displayCards: CardResponse[] = [];
  initialLoading = true;
  showAnswer = false;
  index = 0;
  availableTags: string[] = [];
  selectedTag: string | null = null;
  selectedDifficulty: number | null = null;
  randomOrder = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deckService: DeckService
  ) {}

  ngOnInit(): void {
    this.loadDeck();
  }

  get currentCard(): CardResponse | null {
    return this.displayCards[this.index] ?? null;
  }

  toggleAnswer(): void {
    this.showAnswer = !this.showAnswer;
  }

  nextCard(): void {
    if (this.index < this.displayCards.length - 1) {
      this.index += 1;
      this.showAnswer = false;
    }
  }

  prevCard(): void {
    if (this.index > 0) {
      this.index -= 1;
      this.showAnswer = false;
    }
  }

  restart(): void {
    this.index = 0;
    this.showAnswer = false;
  }

  toggleRandomOrder(): void {
    this.randomOrder = !this.randomOrder;
    this.applyFilters(true);
  }

  shuffleNow(): void {
    this.randomOrder = true;
    this.displayCards = this.shuffleCards(this.filteredCards);
    this.index = 0;
    this.showAnswer = false;
  }

  onFiltersChange(): void {
    this.applyFilters(true);
  }

  exit(): void {
    this.router.navigate(['/my-decks']);
  }

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

  private loadDeck(): void {
    const deckId = Number(this.route.snapshot.paramMap.get('id'));
    if (!deckId) {
      return;
    }

    this.initialLoading = true;
    this.deckService.getDeckById(deckId).subscribe({
      next: (deck) => {
        this.deck = deck;
        this.cards = deck.cards ?? [];
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

  private shuffleCards(cards: CardResponse[]): CardResponse[] {
    const next = [...cards];
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
  }

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
