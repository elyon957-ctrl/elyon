import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FirestoreService } from '../../../services/firestore.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-mens-product',
  imports: [FormsModule],
  templateUrl:'./mens-product.html',
  styleUrl: './mens-product.scss',
})
export class MensProduct implements OnInit {
 private firestore=inject(FirestoreService)
  private auth=inject(AuthService)
//   private fb = inject(FormBuilder);
  private router = inject(Router);
//  private modalService =inject(MdbModalService);
selectedColor: string = '';
selectedPrice: number = 0;
  products:any[] =[];
Categories = history.state.Categories;
isLoggedIn = false;
  ngOnInit(): void {
     this.auth.isLoggedIn$.subscribe(status => {
    this.isLoggedIn = status;
    console.log(status)
  });
  this.getProducts()
  }
getProducts() {
  this.firestore.getList('Products').subscribe((data: any[]) => {
    this.products = data.map(product => {
      const unit = product.units?.[0];
      return {
        ...product,
        selectedUnitIndex: 0,
        selectedPrice: unit?.price || 0,
        selectedActualPrice: unit?.actualPrice || 0,
        discount: this.calcDiscount(unit?.price, unit?.actualPrice)
      };
    });
    console.log(this.products)
  });
}
calcDiscount(price: number, actual: number): number {
  if (!actual || !price) return 0;
  return Math.round(((actual - price) / actual) * 100);
}
selectUnit="S"
onUnitChange(item: any, event: Event) {
  const index = +(event.target as HTMLSelectElement).value;
  const unit = item.units[index];
  this.selectUnit = item.units[index];
  item.selectedUnitIndex = index;
  item.selectedPrice = unit.price;
  item.selectedActualPrice = unit.actualPrice;
  item.discount = this.calcDiscount(unit.price, unit.actualPrice);
}
openProduct(product: any) {
  this.router.navigate(['/mensproductview', product.id],{
      state: { product }}
  )
}
}
