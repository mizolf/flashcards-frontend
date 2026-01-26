import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

import { CreateDeckRequest, DeckResponse } from '../../models/Deck.dto';

@Component({
  selector: 'app-deck-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CheckboxModule, DialogModule, InputTextModule],
  templateUrl: './deck-form-dialog.component.html',
  styleUrl: './deck-form-dialog.component.scss'
})
export class DeckFormDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() deck: DeckResponse | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<CreateDeckRequest>();

  name = '';
  isPublic = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['deck']) {
      if (this.deck) {
        this.name = this.deck.name ?? '';
        this.isPublic = !!this.deck.isPublic;
      } else {
        this.resetForm();
      }
    }

    if (changes['visible'] && this.visible && !this.deck) {
      this.resetForm();
    }
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  submit(): void {
    const trimmedName = this.name.trim();
    if (!trimmedName) {
      return;
    }
    this.save.emit({ name: trimmedName, isPublic: this.isPublic });
  }

  private resetForm(): void {
    this.name = '';
    this.isPublic = false;
  }
}
