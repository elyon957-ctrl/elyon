import { Component, inject, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FirestoreService } from '../../../services/firestore.service';
import { AuthService } from '../../../services/auth.service';
import { MdbModalService } from 'mdb-angular-ui-kit/modal';
import { AuthModalComponent } from '../../auth-modal/auth-modal';
declare var bootstrap: any;
@Component({
  selector: 'app-mens-product-view',
  imports: [],
  templateUrl: './mens-product-view.html',
  styleUrl: './mens-product-view.scss',
})
export class MensProductView  implements OnInit {
cartCount: number =0;
  selectedUnits: { [key: string]: any } = {};
  addedToCart = false;
  quantity: number = 1; 
  product = history.state.product;
  // private modalService =inject(MdbModalService);
  selectUnit=""
isLoggedIn = false;
   ngOnInit(): void {
     this.auth.isLoggedIn$.subscribe(status => {
    this.isLoggedIn = status;
    console.log(status)
  });
  this.getProducts()
  }
    private firestore=inject(FirestoreService)
    private auth=inject(AuthService)
    
onUnitChange(item: any, event: Event) {
  const index = +(event.target as HTMLSelectElement).value;
  const unit = item.units[index];
  this.selectUnit = item.units[index];
  item.selectedUnitIndex = index;
  item.selectedPrice = unit.price;
  item.selectedActualPrice = unit.actualPrice;
  item.discount = this.calcDiscount(unit.price, unit.actualPrice);
}
calcDiscount(price: number, actual: number): number {
  if (!actual || !price) return 0;
  return Math.round(((actual - price) / actual) * 100);
}
  addProduct(item: any) {
    const userId = this.auth.userDetails?.id;
    const selectedUnit = this.selectedUnits[item.id] || item.units[0];
     item.added=true,
  item.quantity= this.quantity;
  let path = `Users/${userId}/Cart/${item.id}`;
    this.firestore.set(path, {
      name:item.name,
      price:selectedUnit.price,
      units:this.selectUnit,
      quantity: item.quantity,
      added: item.added,
      image: item.image,
      productId: item?.id,
      productCategory:item.category
    }).then((msg: any) => {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Product Added to Cart',
        showConfirmButton: false,
        timer: 1000,
        customClass: {
          popup: 'small-toast'
        }
      });
    });
    this.addedToCart = false;
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
    this.groupedProducts = this.chunk(this.products, 3);
    this.currentIndex = 0;
    console.log(this.products)
  });
}

products: any=[]

groupedProducts: any[] = [];
currentIndex = 0;


chunk(arr: any[], size: number) {
  return arr.reduce((acc, _, i) => {
    if (i % size === 0) acc.push(arr.slice(i, i + size));
    return acc;
  }, []);
}


next() {
  if (this.currentIndex < this.groupedProducts.length - 1) {
    this.currentIndex++;
  }
}

prev() {
  if (this.currentIndex > 0) {
    this.currentIndex--;
  }
}



openAuthModal() {
  const modalEl = document.getElementById('authModal');
  if (!modalEl) return;

  let modal = bootstrap.Modal.getInstance(modalEl);
  if (!modal) {
    modal = new bootstrap.Modal(modalEl, {
      backdrop: 'static',
      keyboard: false
    });
  }

  modal.show();
}
}
