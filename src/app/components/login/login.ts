import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MdbModalRef,MdbModalModule,MdbModalService } from 'mdb-angular-ui-kit/modal';
import { Signin } from '../signin/signin';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule,MdbModalModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email= ""
  password= ""
  errorMessage= ""
  rememberMe = true;
 constructor(public modalRef: MdbModalRef<Login>,private authService: AuthService,private modalService: MdbModalService) {}

 hide = signal(true);

togglePassword() {
  this.hide.set(!this.hide());
}

  login() {
    this.authService.login(this.email, this.password)
      .then((user:any) => { 
      })
      .catch((err:any) => {
        this.errorMessage = err.message;
      });
      this.modalRef.close();
  }

   openLoginModal() {
    this.modalService.open(Signin, {
      modalClass: 'modal-dialog-centered'
    });
  }
   close() {
    this.modalRef.close();
  }
}
