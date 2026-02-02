import { Component } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { take } from 'rxjs';
// import { PaymentService } from '../../../services/payment.service';
declare var Razorpay: any;

@Component({
  selector: 'app-payment',
  imports: [],
  templateUrl: './payment.html',
  styleUrl: './payment.scss'
})
export class Payment {
  cartItems: any[] = [];
  total: number = 0;
  amount:number =0;
  paymentid :any;
  constructor(private cartService: FirestoreService,private router: Router,private route: ActivatedRoute, private authService: AuthService) {}

ngOnInit() {
  this.route.params.subscribe((param)=>{
      this.getCart();
      
  });
  
}
 getCart() {
    const userId = this.authService.userDetails?.id;
    if (userId) {
      this.cartService.getList(`Users/${userId}/selectcart`).subscribe((cart) => {
        this.cartItems = cart;
          this.total = this.cartItems.reduce(
          (sum, item) => sum + (item.price * (item.quantity || 1)),
          0
        );
      }, (error: any) => {
        console.error('Error fetching tasks:', error);
      });
    } else {
      console.warn('No user is logged in.');
    }
  }

orderPlaced() {
  const userId = this.authService.userDetails?.id;
  if (!userId) {
    console.warn('No user logged in.');
    return;
  }

  try {
    for (const item of this.cartItems) {
      const updatedItem = {
        ...item,
        paymentmethod: this.paymentid,
        paymentAmount: this.amount,
        status: "order"
      };

       this.cartService.add(updatedItem, `Users/${userId}/OrderPlaced`);
      if (item.id,item.productId) {
       this.cartService.delete(item.id, `Users/${userId}/selectcart`);
       this.cartService.delete(item.productId, `Users/${userId}/Cart`);
      }
    }

    this.cartItems = [];
    Swal.fire({
  title: "Order Placed Successful!",
  icon: "success",
  draggable: true
});
    console.log("Order placed successfully!");
    this.navto('home');
  } catch (err) {
    console.error('Error placing order:', err);
  }
}
 navto(path: string) {
    this.router.navigate([path]);
  } 
   goBack() {
    const userId = this.authService.userDetails?.id;
    if (!userId) return;
  
    this.cartService.getList(`Users/${userId}/selectcart`).pipe(take(1)).subscribe({
      next: (items:any) => {
        items.forEach((item: any) => {
          if (item.id) {
            this.cartService.delete(item.id, `Users/${userId}/selectcart`);
          }
        });
  
        this.navto('address');
      },
      error: (err:any) => console.error('Error fetching selectcart items:', err)
    });
  }
payNow(amount: number) {
  const options = {
    key: 'rzp_test_S62Fm2mui52Jn7',
    amount: amount * 100,
    currency: 'INR',
    name: 'My App',
    description: 'Product Payment',

    handler: async (response: any) => {
      console.log('Razorpay response:', response);

      // Save payment response
      this.paymentid = response;
      this.amount = amount;

      const paymentData = {
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id || null,
        signature: response.razorpay_signature || null,
        amount: amount,
        currency: 'INR',
        status: 'SUCCESS',
      };

      // ✅ Place order ONLY after success
      await this.orderPlaced();

      // ✅ Navigate after order placed
      this.navto('address');
    },

    modal: {
      ondismiss: () => {
        console.log('Payment popup closed');
      }
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}

}
