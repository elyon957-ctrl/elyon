import { CommonModule } from '@angular/common';
import {  Component, Inject, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../services/firestore.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { AddressAdd } from './address-add/address-add';
import { take } from 'rxjs';

@Component({
  selector: 'app-address',
  imports: [AddressAdd,],
  templateUrl: './address.html',
  styleUrl: './address.scss'
})
export class Address {
@ViewChild(AddressAdd) addressAddComponent!: AddressAdd;

  savedAddress: any[] = [];
  userId: string | null = null;
item: any;

  constructor(
    private firestoreService: FirestoreService,
    @Inject(AuthService) private authService: AuthService,
    private router: Router,
    
  ) {}

  async ngOnInit() {
    const uid = this.authService.getCurrentUser()?.uid;
    this.userId = uid !== undefined ? uid : null; // Get the current user's ID
    if (this.userId) {
      await this.getActivities();
    } else {
      console.warn('No user is logged in.');
    }
  }

  async getActivities() {
    return new Promise<void>((resolve, reject) => {
      this.firestoreService.getList(`Users/${this.userId}/Address`).pipe(take(1)).subscribe({
        next: (data: any) => {
          this.savedAddress = data.map((activity: any) => ({
            ...activity
          }));
          resolve();
          
        },
        error: (error) => {
          console.error('Error fetching savedAddress:', error);
          reject(error);
        }
      });
    });
  }
  
  openModal() {
    const modalEl = document.getElementById('myModal');
    const modal = new (window as any).bootstrap.Modal(modalEl);
    modal.show();
  }

  closeModal() {
    const modalEl = document.getElementById('myModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
    if (modal) {
      modal.hide();
    }
  }

  onSubmit() {
    if (this.addressAddComponent && this.addressAddComponent.onSubmit) {
      this.addressAddComponent.onSubmit();
      this.closeModal()
      this.getActivities()
    } else {
      console.error('addressAddComponent component not available or not loaded yet.');
    }
    
  }
  
deliverHere(address: any) {
  const userId = this.authService.userDetails?.id;
  console.log("test",userId)
  if (!userId) return;

  this.firestoreService.getList(`Users/${userId}/selectcart`).pipe(take(1)).subscribe(items => {
    items.forEach(item => {
      const updatedItem = {
        ...item,
        customerName: address.name,
        customerAddress: address.address,
        city: address.city,
        state: address.state,
        zip: address.zip,
        phoneNumber:address.phonenumber
      };

      this.firestoreService.update(updatedItem, `Users/${userId}/selectcart/${item.id}`)
        .then(() => console.log("Address added to:", updatedItem))
        .catch(err => console.error("Error updating selectcart:", err));
    });
    this.navto('payment');
  });
}
  navto(path: string) {
    this.router.navigate([path]);
  } 

  goBack() {
  const userId = this.authService.userDetails?.id;
  if (!userId) return;

  this.firestoreService.getList(`Users/${userId}/selectcart`).pipe(take(1)).subscribe({
    next: (items) => {
      items.forEach((item: any) => {
        if (item.id) {
          this.firestoreService.delete(item.id, `Users/${userId}/selectcart`);
        }
      });

      this.navto('cart');
    },
    error: (err) => console.error('Error fetching selectcart items:', err)
  });
}

  }

