import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiGenerateDialogComponent } from './ai-generate-dialog.component';

describe('AiGenerateDialogComponent', () => {
  let component: AiGenerateDialogComponent;
  let fixture: ComponentFixture<AiGenerateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiGenerateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiGenerateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
