import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
})
export class Wishlist implements OnInit {
protected Math = Math;
private firestore = inject (FirestoreService);
 private router     = inject(Router);
  private auth       = inject(AuthService);
    isLoggedIn               = false;
    userId:any
ngOnInit(): void {
     this.auth.isLoggedIn$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
    });
    this.userId = this.auth.userDetails?.id;
    this.getProducts();
}
getProducts() {
    const userId = this.auth.userDetails?.id;
  this.firestore.getList(`Users/${userId}/Wishlist`).subscribe((data: any[]) => {
this.wishlistItems = data.map(product => {
      const unit = product.units?.[0];
      return {
        ...product,
        selectedUnitIndex: 0,
        selectedPrice: unit?.price || 0,
        selectedActualPrice: unit?.actualPrice || 0,
        discount: this.calcDiscount(unit?.price, unit?.actualPrice)
      };
    });
    console.log(this.wishlistItems)
  }
)}
calcDiscount(price: number, actual: number): number {
  if (!actual || !price) return 0;
  return Math.round(((actual - price) / actual) * 100);
}
  wishlistItems: any[] =[]
 
  removeItem(id: string) {
    const userId = this.auth.userDetails?.id;
    if (!userId || !id) return;

    this.wishlistItems = this.wishlistItems.filter(item => item.id !== id);
    this.firestore.delete(id, `Users/${userId}/Wishlist`)
      .then(() => console.log(' Item removed from Firestore'))
      .catch((err:any) => console.error('Error removing item:', err));
  }
  
  openProduct(product: any) {
  this.router.navigate(['/mensproductview', product.id],{
      state: { product }}
  )
}

}
