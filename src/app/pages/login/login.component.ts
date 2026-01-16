import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DialogModule } from 'primeng/dialog';
import { FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule  } from '@angular/forms';

import { LoginUserDTO } from '../../models/LoginUserDTO.dto';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { RegisterUserDTO } from '../../models/RegisterUserDTO.dto';
import { VerifiedUserDTO } from '../../models/VerifiedUserDTO.dto';

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
    ReactiveFormsModule,
    DialogModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isLoginMode = true;
  showVerification = false;
  loading: boolean = false;
  verificationCode: string = '';
  verificationEmail: string = '';

  modeOptions = [
    { label: 'Registracija', value: 'register' },
    { label: 'Prijava', value: 'login' }
  ];
  selectedMode: string = 'login';

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  registerForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ){}

  public toggleMode(mode: 'login' | 'register'): void {
    this.isLoginMode = mode === 'login';
    this.showVerification = false;
  }

  public onModeChange(): void {
    this.isLoginMode = this.selectedMode === 'login';
    this.showVerification = false;
  }

  public register(): void {
    if (this.registerForm.invalid) {
      return;
    }

    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      // Prikaži error - lozinke se ne podudaraju
      return;
    }

    this.loading = true;
    
    const request: RegisterUserDTO = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    }

    this.authService.signup(request).subscribe({
      next: (response) => {
        this.loading = false;
        this.verificationEmail = this.registerForm.value.email;
        this.showVerification = true;
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration failed. Please try again.', err)
      },
    });
  }

  public login(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const request: LoginUserDTO = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    }

    this.authService.login(request).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/home']); 
      },
      error: (err) => {
        this.loading = false;
        console.error('Invalid username or password. Please try again.', err);
      },
    });
  }

  public verify(): void {
    const request: VerifiedUserDTO = {
      email: this.verificationEmail,
      verificationCode: this.verificationCode
    };
    
    this.authService.verify(request).subscribe({
      next: () => {
        this.showVerification = false;
        this.selectedMode = 'login';
        this.isLoginMode = true;

      },
      error: (err) => {
        console.error('Verification failed', err);
      }
    });
  }

  public resendCode(): void {
    this.authService.resendVerificationCode(this.verificationEmail).subscribe({
      next: () => {
        console.log('Verification code resent successfully');
      },
      error: (err) => {
        console.error('Resend failed', err);
      }
    });
  }
}
