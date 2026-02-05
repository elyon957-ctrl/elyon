import { Component, OnInit,  ChangeDetectionStrategy, signal } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
  imports: [RouterLink],
})
export class Cart implements OnInit {
  total: number = 0;
  cartQuantity: number = 0;
  cartItems: any[] = [];
  isLoading: boolean = false;
  userId: any;

  constructor(
    private cartService: FirestoreService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    
  ) {}

  ngOnInit() {
    console.log(' Cart Component Initialized');
    this.route.params.subscribe(() => this.getCart());
  }

  getCart() {
    console.log('Fetching cart items...');
    this.isLoading = true;
    const userId = this.authService.userDetails?.id;
    console.log(' User ID:',userId);
    if (!userId) return;

    this.cartService.getList(`Users/${userId}/Cart`).subscribe({
      next: (cart:any) => {
        this.cartItems = cart;
        console.log(' Cart Items:',this.cartItems);
        this.total = this.cartItems.reduce(
          (sum, item) => sum + (item.price * (item.quantity || 1)),
          0
        );
        this.isLoading = false;
        
      },
      error: (err) => {
        console.error('Error fetching cart:', err);
        this.isLoading = false;
        
      }
    });
  }

  removeItem(id: string) {
    const userId = this.authService.userDetails?.id;
    if (!userId || !id) return;

    this.cartItems = this.cartItems.filter(item => item.id !== id);
    this.updateTotal();

    this.cartService.delete(id, `Users/${userId}/Cart`)
      .then(() => console.log(' Item removed from Firestore'))
      .catch((err:any) => console.error('Error removing item:', err));
  }
  
  updateQuantity(item: any) {
    const userId = this.authService.userDetails?.id;
    if (!userId || !item?.id) return;
    this.updateTotal();
    
    console.log('Updating quantity for item:', item);
    this.cartService.update(item,`Users/${userId}/Cart/${item.id}`)
      .then(() => console.log(' Quantity updated in Firestore'))
      .catch((err:any) => console.error('Error updating quantity:', err));
  }
  updateTotal() {
    this.total = this.cartItems.reduce(
      (sum, item) => sum + (item.price * (item.quantity || 1)),
      0
    );
    
  }
increaseQuantity(item: any) {
  item.quantity++;
  this.updateQuantity(item);
}

decreaseQuantity(item: any,id: string) {
  if (item && item.quantity > 1) {
    item.quantity--;
    this.updateQuantity(item);
  } else if (item && item.quantity <= 1) {
    item.added = false;
    item.quantity = 0;
    this.removeItem(id)
    Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Product Remove to Cart',
            showConfirmButton: false,
            timer: 1000,
            customClass: {
              popup: 'small-toast'
            }
          });
  }
}
  activeTab="oil";
  tabs : any =[];
cartCount: number =0;

  buyItem() {
    const userId = this.authService.userDetails?.id;
    if (!userId || !this.cartItems?.length) return;

    Promise.all(
      this.cartItems.map(item =>
        this.cartService.add(
          { ...item, productId: item.id,
            price:item.price+5, addedAt: new Date() },
          `Users/${userId}/selectcart`
        )
      )
    )
      .then(() => this.router.navigate(['/address'], { state: { items: this.cartItems } }))
      .catch(console.error);
  }

  navto(path: string) {
    this.router.navigate(['/mens', path]);
  }
}
