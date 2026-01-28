import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { switchMap } from 'rxjs';

import {
  CardAnswerRequest,
  QuickLearnCardResponse,
  QuickLearnResultResponse,
  QuickLearnSessionResponse
} from '../../models/QuickLearn.dto';
import { AuthenticationService } from '../../services/authentication.service';
import { QuickLearnService } from '../../services/quick-learn.service';
import { UI_TEXT } from '../../constants/ui-text';

@Component({
  selector: 'app-deck-quick-learn',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './deck-quick-learn.component.html',
  styleUrl: './deck-quick-learn.component.scss'
})
export class DeckQuickLearnComponent implements OnInit {
  /** Static UI copy for the template. */
  readonly text = UI_TEXT;
  /** Active quick learn session payload. */
  session: QuickLearnSessionResponse | null = null;
  /** Cards returned by the session. */
  cards: QuickLearnCardResponse[] = [];
  /** Current card index. */
  index = 0;
  /** True when the answer side is visible. */
  showAnswer = false;
  /** True while the session is loading. */
  loading = true;
  /** True while submit request is running. */
  submitting = false;
  /** Session/deck stats returned after submit. */
  results: QuickLearnResultResponse | null = null;
  /** Local answer map keyed by card id. */
  answers: Record<number, boolean> = {};

  /** Provides routing, auth, and quick-learn API access. */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quickLearnService: QuickLearnService,
    private authService: AuthenticationService
  ) {}

  /** Starts a new quick learn session on first render. */
  ngOnInit(): void {
    this.startSession();
  }

  /** Current card in the session. */
  get currentCard(): QuickLearnCardResponse | null {
    return this.cards[this.index] ?? null;
  }

  /** Count of cards already answered. */
  get answeredCount(): number {
    return Object.keys(this.answers).length;
  }

  /** True when all cards are answered. */
  get isComplete(): boolean {
    return this.cards.length > 0 && this.answeredCount === this.cards.length;
  }

  /** Toggles answer visibility. */
  toggleAnswer(): void {
    this.showAnswer = !this.showAnswer;
  }

  /**
   * Records answer correctness and advances to the next card.
   * @param correct True if the user answered correctly.
   */
  markAnswer(correct: boolean): void {
    const current = this.currentCard;
    if (!current) {
      return;
    }

    this.answers[current.cardId] = correct;

    if (this.index < this.cards.length - 1) {
      this.index += 1;
      this.showAnswer = false;
    }
  }

  /** Submits session results to the API. */
  submitResults(): void {
    if (!this.session || this.submitting || !this.isComplete) {
      return;
    }

    const answers: CardAnswerRequest[] = this.cards.map((card) => ({
      cardId: card.cardId,
      correct: !!this.answers[card.cardId]
    }));

    this.submitting = true;
    this.quickLearnService.submitResults(this.session.deckId, { answers }).subscribe({
      next: (results) => {
        this.results = results;
        this.submitting = false;
      },
      error: (err) => {
        console.error('Submit quick learn failed', err);
        this.submitting = false;
      }
    });
  }

  /**
   * Normalizes accuracy values to a 0-100 percentage.
   * @param value Accuracy as 0-1 or 0-100.
   */
  getAccuracyPercent(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }
    const normalized = value > 1 ? value : value * 100;
    return Math.max(0, Math.min(100, normalized));
  }

  /** Starts a fresh session and resets local state. */
  restart(): void {
    this.startSession();
  }

  /** Navigates back to the deck detail screen. */
  goBack(): void {
    this.router.navigate(['/my-decks']);
  }

  /** Starts a new session and initializes local state. */
  private startSession(): void {
    const deckId = Number(this.route.snapshot.paramMap.get('id'));
    if (!deckId) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.results = null;
    this.answers = {};
    this.index = 0;
    this.showAnswer = false;

    this.authService.checkAuthStatus().pipe(
      switchMap(() => this.quickLearnService.startSession(deckId))
    ).subscribe({
      next: (session) => {
        if (!session) {
          this.session = null;
          this.cards = [];
          this.loading = false;
          return;
        }
        this.session = session;
        this.cards = session.cards ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Start quick learn failed', err);
        this.loading = false;
      }
    });
  }
}
