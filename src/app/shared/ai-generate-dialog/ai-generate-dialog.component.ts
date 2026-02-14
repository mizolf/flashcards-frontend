import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';

import { GeneratedCardDTO, SelectableGeneratedCard } from '../../models/AiCard.dto';
import { AiCardService } from '../../services/ai-card.service';
import { UI_TEXT } from '../../constants/ui-text';

type DialogStep = 'input' | 'generating' | 'preview' | 'saving';
type InputMode = 'text' | 'pdf';

@Component({
  selector: 'app-ai-generate-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputTextarea,
    CheckboxModule
  ],
  templateUrl: './ai-generate-dialog.component.html',
  styleUrl: './ai-generate-dialog.component.scss'
})
export class AiGenerateDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() deckId: number | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() cardsGenerated = new EventEmitter<number>();

  readonly text = UI_TEXT;
  readonly MIN_TEXT_LENGTH = 10;
  readonly MAX_TEXT_LENGTH = 50000;
  readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  step: DialogStep = 'input';
  inputMode: InputMode = 'text';

  textContent = '';
  selectedFile: File | null = null;
  fileError: string | null = null;

  generatedCards: SelectableGeneratedCard[] = [];
  errorMessage: string | null = null;

  difficultyOptions = [
    { label: 'Low', value: 1 },
    { label: 'Medium', value: 2 },
    { label: 'Hard', value: 3 }
  ];

  constructor(private aiCardService: AiCardService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.resetDialog();
    }
  }

  get isTextValid(): boolean {
    const len = this.textContent.trim().length;
    return len >= this.MIN_TEXT_LENGTH && len <= this.MAX_TEXT_LENGTH;
  }

  get isFileValid(): boolean {
    return this.selectedFile !== null && this.fileError === null;
  }

  get canGenerate(): boolean {
    return this.inputMode === 'text' ? this.isTextValid : this.isFileValid;
  }

  get selectedCount(): number {
    return this.generatedCards.filter(c => c.selected).length;
  }

  get allSelected(): boolean {
    return this.generatedCards.length > 0 && this.generatedCards.every(c => c.selected);
  }

  get textLength(): number {
    return this.textContent.trim().length;
  }

  setInputMode(mode: InputMode): void {
    this.inputMode = mode;
    this.errorMessage = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.validateAndSetFile(input.files[0]);
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.validateAndSetFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private validateAndSetFile(file: File): void {
    this.fileError = null;

    if (file.type !== 'application/pdf') {
      this.fileError = this.text.aiGenerateDialog.invalidFileType;
      this.selectedFile = null;
      return;
    }

    if (file.size > this.MAX_FILE_SIZE) {
      this.fileError = this.text.aiGenerateDialog.fileTooLarge;
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

  clearFile(): void {
    this.selectedFile = null;
    this.fileError = null;
  }

  generate(): void {
    if (!this.deckId || !this.canGenerate) return;

    this.step = 'generating';
    this.errorMessage = null;

    const request$ = this.inputMode === 'text'
      ? this.aiCardService.generateFromText(this.deckId, this.textContent.trim())
      : this.aiCardService.generateFromPdf(this.deckId, this.selectedFile!);

    request$.subscribe({
      next: (response) => {
        this.generatedCards = response.cards.map(card => ({
          ...card,
          selected: true
        }));
        this.step = this.generatedCards.length > 0 ? 'preview' : 'input';
        if (this.generatedCards.length === 0) {
          this.errorMessage = this.text.aiGenerateDialog.noCardsGenerated;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.step = 'input';
        this.errorMessage = this.getErrorMessage(err);
      }
    });
  }

  toggleSelectAll(): void {
    const newState = !this.allSelected;
    this.generatedCards.forEach(c => c.selected = newState);
  }

  saveSelected(): void {
    if (!this.deckId || this.selectedCount === 0) return;

    this.step = 'saving';
    const cardsToSave: GeneratedCardDTO[] = this.generatedCards
      .filter(c => c.selected)
      .map(({ selected, ...card }) => card);

    this.aiCardService.saveGeneratedCards(this.deckId, cardsToSave).subscribe({
      next: (response) => {
        this.cardsGenerated.emit(response.totalSaved);
        this.close();
      },
      error: (err: HttpErrorResponse) => {
        this.step = 'preview';
        this.errorMessage = this.getErrorMessage(err);
      }
    });
  }

  goBack(): void {
    this.step = 'input';
    this.errorMessage = null;
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  private resetDialog(): void {
    this.step = 'input';
    this.inputMode = 'text';
    this.textContent = '';
    this.selectedFile = null;
    this.fileError = null;
    this.generatedCards = [];
    this.errorMessage = null;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400: return this.text.aiGenerateDialog.errors.invalidInput;
      case 403: return this.text.aiGenerateDialog.errors.forbidden;
      case 404: return this.text.aiGenerateDialog.errors.notFound;
      case 413: return this.text.aiGenerateDialog.errors.fileTooLarge;
      default: return this.text.aiGenerateDialog.errors.generic;
    }
  }

  getDifficultyLabel(value: number): string {
    return this.difficultyOptions.find(o => o.value === value)?.label ?? '';
  }
}
