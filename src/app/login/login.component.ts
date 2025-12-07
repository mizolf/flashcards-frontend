import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    SelectButtonModule,
    FormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isLoginMode = true;
  showVerification = false;
  public value: string | undefined;

  modeOptions = [
    { label: 'Registracija', value: 'register' },
    { label: 'Prijava', value: 'login' }
  ];
  selectedMode: string = 'login';

  toggleMode(mode: 'login' | 'register'): void {
    this.isLoginMode = mode === 'login';
    this.showVerification = false;
  }

  onModeChange(): void {
    this.isLoginMode = this.selectedMode === 'login';
    this.showVerification = false;
  }
}
