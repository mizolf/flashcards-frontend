import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { CardResponse } from '../../models/Card.dto';
import { DeckDetailResponse } from '../../models/Deck.dto';
import { DeckService } from '../../services/deck.service';

@Component({
  selector: 'app-deck-practice',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './deck-practice.component.html',
  styleUrl: './deck-practice.component.scss'
})
export class DeckPracticeComponent implements OnInit {
  deck: DeckDetailResponse | null = null;
  cards: CardResponse[] = [];
  loading = false;
  showAnswer = false;
  index = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deckService: DeckService
  ) {}

  ngOnInit(): void {
    this.loadDeck();
  }

  get currentCard(): CardResponse | null {
    return this.cards[this.index] ?? null;
  }

  toggleAnswer(): void {
    this.showAnswer = !this.showAnswer;
  }

  nextCard(): void {
    if (this.index < this.cards.length - 1) {
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

  exit(): void {
    this.router.navigate(['/my-decks']);
  }

  private loadDeck(): void {
    const deckId = Number(this.route.snapshot.paramMap.get('id'));
    if (!deckId) {
      return;
    }

    this.loading = true;
    this.deckService.getDeckById(deckId).subscribe({
      next: (deck) => {
        this.deck = deck;
        this.cards = deck.cards ?? [];
        this.loading = false;
        this.index = 0;
        this.showAnswer = false;
      },
      error: (err) => {
        console.error('Load deck failed', err);
        this.loading = false;
      }
    });
  }
}
