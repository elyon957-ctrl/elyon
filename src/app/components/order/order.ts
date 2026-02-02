import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-order',
  imports: [],
  templateUrl: './order.html',
  styleUrl: './order.scss',
})
export class Order {
 cartService: any;
  constructor(private firestore:FirestoreService,
    private router: Router,
    private route: ActivatedRoute, 
    private authService: AuthService,
   ){}
  orderItems: any;
  isloading=true;
ngOnInit() {
  this.route.params.subscribe((param)=>{
      this.getCart();
  });
}
 getCart() {
    const userId = this.authService.userDetails?.id;
    if (userId) {
      this.firestore.getList(`Users/${userId}/OrderPlaced`).subscribe((order) => {
        this.orderItems = order;
        this.isloading = false
         
      }, (error: any) => {
        console.error('Error fetching order:', error);
      });
    } else {
      console.warn('No user is logged in.');
    }
  }
  formatTimestamp(timestamp: any): string {
  if (!timestamp) return '';

  const date = timestamp.toDate(); 
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  return date.toLocaleString('en-IN', options);
}

removeItem(id: string) {
    const userId = this.authService.userDetails?.id;
    if (!userId || !id) return;
    console.log('Removing item with ID:', this.firestore);
    this.firestore.delete(id, `Users/${userId}/OrderPlaced`)
    .then(() => console.log(' Item removed from Firestore'))
    .catch((err:any) => console.error('Error removing item:', err));
    Swal.fire({
      title: "Order Cancel Successful!",
      icon: "info",
      draggable: true
    });
    

  }
}