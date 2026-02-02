import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../services/auth.service';
import { FirestoreService } from '../../../../services/firestore.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-address-add',
  imports: [FormsModule, CommonModule,
    ReactiveFormsModule],
  templateUrl: './address-add.html',
  styleUrl: './address-add.scss'
})
export class AddressAdd {
  addressForm: FormGroup | undefined;
  userId: string | null = null;

  firebaseService = inject(FirestoreService);
  private formbuild = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);

  ngOnInit(): void {
    this.addressForm = this.formbuild.group({
        name: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      phonenumber: ['', Validators.required],
    });

    const uid = this.authService.getCurrentUser()?.uid;
    this.userId = uid === undefined ? null : uid; 
    if (!this.userId) {
      console.warn('No user is logged in. Redirecting to home.');
      this.nav('/mens'); 
    }
  }

  onSubmit() {
    if (this.addressForm?.valid) {
      let activityValue = { ...(this.addressForm?.value ?? {}), userId: this.userId }; 
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Address Added Successfully',
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          popup: 'small-toast'
        }
      });
      console.log(activityValue);
      this.firebaseService.add(activityValue, `Users/${this.userId}/Address`); 
      this.addressForm.reset();
      this.nav('/address');
      
    } else {
      alert("Please enter valid data");
    }
  }
  nav(path: string) {
    console.log('Navigating to:', path);
    this.addressForm?.reset();
    this.router.navigate([path]);
  }
}
