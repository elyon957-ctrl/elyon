import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  imports: [CommonModule, FormsModule],
  templateUrl: './signin.html',
  styleUrl: './signin.scss',
})
export class Signin {
  name ='';
  createpassword = '';
  createemail = '';
  confirmPassword = '';
  errorMessage = '';
 constructor(public modalRef: MdbModalRef<Signin>,private authService: AuthService,private router: Router) {}

 hide = signal(true);

togglePassword() {
  this.hide.set(!this.hide());
}

 registerUser() {
    this.authService.register(this.createemail, this.createpassword, this.name)
      .then((res) => {
        console.log(res)

        this.router.navigate(['/mens']);
      })
      .catch((err) => {
        alert('Registration failed: ' + err.message);
      });
      this.modalRef.close();
  }
 close() {
    this.modalRef.close();
  }
  
}
