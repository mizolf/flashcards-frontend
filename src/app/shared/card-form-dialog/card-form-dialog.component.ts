import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';

import { CardResponse, CreateCardRequest } from '../../models/Card.dto';

@Component({
  selector: 'app-card-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    InputTextarea
  ],
  templateUrl: './card-form-dialog.component.html',
  styleUrl: './card-form-dialog.component.scss'
})
export class CardFormDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() card: CardResponse | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<CreateCardRequest>();

  question = '';
  answer = '';
  tag = '';
  difficulty: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['card']) {
      if (this.card) {
        this.question = this.card.question ?? '';
        this.answer = this.card.answer ?? '';
        this.tag = this.card.tag ?? '';
        this.difficulty = this.card.difficulty ?? null;
      } else {
        this.resetForm();
      }
    }

    if (changes['visible'] && this.visible && !this.card) {
      this.resetForm();
    }
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  submit(): void {
    const trimmedQuestion = this.question.trim();
    const trimmedAnswer = this.answer.trim();
    if (!trimmedQuestion || !trimmedAnswer) {
      return;
    }

    this.save.emit({
      question: trimmedQuestion,
      answer: trimmedAnswer,
      tag: this.tag.trim() || undefined,
      difficulty: this.difficulty ?? undefined
    });
  }

  private resetForm(): void {
    this.question = '';
    this.answer = '';
    this.tag = '';
    this.difficulty = null;
  }
}
