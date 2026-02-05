import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;
@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth-modal.html',
  styleUrls: ['./auth-modal.scss']
})
export class AuthModalComponent {

  isLogin = true;

  email = '';
  password = '';
  name = '';
  gender = '';

    errorMessage= ""

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleForm() {
    this.isLogin = !this.isLogin;
  }

login() {
  this.errorMessage = '';
  this.isLoading = true;

  this.authService.login(this.email, this.password)
    .then(() => {
      this.isLoading = false;
      this.close();                
      this.router.navigate(['/mens']); 
    })
    .catch((err: any) => {
      this.isLoading = false;
      this.errorMessage = err.message;
    });
}

  

  showPassword: boolean = false;
  isLoading: boolean = false;
confirmPassword: string = '';
  agreeToTerms: boolean = false;
  
  showConfirmPassword: boolean = false;

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  async handleSignup(): Promise<void> {
    this.errorMessage = '';
   await this.authService.register(this.email, this.password, this.name,this.gender)
    .then(() => {
      this.isLoading = false;
      this.close();                
      this.router.navigate(['/mens']); 
    })
    .catch((err: any) => {
      this.isLoading = false;
      this.errorMessage = err.message;
      if (!this.name || !this.email || !this.password || !this.confirmPassword) {
        this.errorMessage = 'Please fill in all fields';
        return;
      }
  
      if (!this.isValidEmail(this.email)) {
        this.errorMessage = 'Please enter a valid email address';
        return;
      }
  
      if (this.password.length < 8) {
        this.errorMessage = 'Password must be at least 8 characters long';
        return;
      }
  
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        return;
      }
  
      if (!this.agreeToTerms) {
        this.errorMessage = 'You must agree to the Terms and Conditions';
        return;
      }
    });

    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      console.log('Signup attempt:', {
        name: this.name,
        email: this.email,
        password: '***',
        gender:this.gender
      });
      this.isLoading = false;
    }, 1500);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
close() {
  const modalEl = document.getElementById('authModal');
  if (!modalEl) return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.hide();
}
passwordMatchValidator(form: any) {
  const password = form.get('password')?.value;
  const confirm = form.get('confirmPassword')?.value;
  return password === confirm ? null : { mismatch: true };
}
}