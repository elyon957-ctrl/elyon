import { Component, ElementRef, inject, Input, OnInit, signal, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { FirestoreService } from '../../../services/firestore.service';
import { AuthService } from '../../../services/auth.service';
import { MdbModalService } from 'mdb-angular-ui-kit/modal';
import { AuthModalComponent } from '../../auth-modal/auth-modal';
import { Router } from '@angular/router';
declare var bootstrap: any;
@Component({
  selector: 'app-womens-product-view',
  imports: [],
  templateUrl: './womens-product-view.html',
  styleUrl: './womens-product-view.scss',
})
export class WomensProductView implements OnInit {
cartCount: number =0;
  selectedUnits: { [key: string]: any } = {};
  addedToCart = false;
  quantity: number = 1; 
  // private modalService =inject(MdbModalService);
  selectUnit: any ={};
  isLoggedIn = false;
  private router     = inject(Router);
 product: any;


  
  ngOnInit(): void {
    const stateProduct = history.state.product;

  if (!stateProduct) {
    console.warn('No product in history state');
    return;
  }

  this.product = stateProduct;
  this.mapImages(this.product);
    this.auth.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      console.log(status)
      
    });
  this.getProducts()
  }
    private firestore=inject(FirestoreService)
    private auth=inject(AuthService)
    selectedUnit = signal<any>(null);
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
  let path = `Users/${userId}/Cart/${item.id}-${this.selectUnit?.label}`;
    this.firestore.set(path, {
      name:item.name,
      price:item.selectedPrice,
      units:this.selectUnit,
      quantity: item.quantity,
      added: item.added,
      image: item.image,
      productId: item?.id,
      productCategory:item.category
    }).then((msg: any) => {
      Swal.fire({
  position: 'center',
  icon: 'success',
  title: 'Added to Cart',
  html: `
    <div class="cart-anim">
      <i class="fas fa-shopping-cart"></i>
      <p>Product added successfully</p>
    </div>
  `,
  showConfirmButton: false,
  timer: 1200,
  backdrop: 'rgba(0,0,0,0.4)',
  customClass: {
    popup: 'cart-toast'
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
    console.log(this.products)
  });
}

products: any=[]

groupedProducts: any[] = [];
currentIndex = 0;



  //  @Input() product!: any;

  isWishlisted = false;

  toggleWishlist(event: Event) {
    event.stopPropagation(); 
    this.isWishlisted = !this.isWishlisted;
  }
  @ViewChild('trendingTrack') trendingTrack!: ElementRef<HTMLDivElement>;
  scrollTrending(direction: number) {
    const track = this.trendingTrack.nativeElement;
    const card  = track.querySelector('.trending__card') as HTMLElement | null;
    if (!card) return;

    const cardWidth = card.offsetWidth + 20; 
    track.scrollLeft += direction * cardWidth;
  }
  openProduct(Categories: any) {
    this.router.navigate(['/mensproduct/:id', Categories.id], {
      state: { Categories }
    });
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


 protected Math = Math;

selectedImageIndex = signal(0);
selectedVariant = signal('M');
productImages = signal<string[]>([]);

mapImages(product: any) {
  const images = [
    product.image,
    product.image2,
    product.image3,
    product.image4
  ].filter(Boolean);

  this.productImages.set(images);
  this.selectedImageIndex.set(0); // reset 🔑
}
  addProductWishlist(item: any) {
        const userId = this.auth.userDetails?.id;
        this.firestore.set(`Users/${userId}/Wishlist/${item.id}`,item).then((msg: any) => {
         Swal.fire({
  position: 'center',
  icon: 'success',
  title: 'Added to Wishlist',
  html: `
    <div class="cart-anim">
      <i class="fa-solid fa-heart" style="color: #ff0000;"></i>
      <p>Product added successfully</p>
    </div>
  `,
  showConfirmButton: false,
  timer: 1200,
  backdrop: 'rgba(0,0,0,0.4)',
  customClass: {
    popup: 'cart-toast'
  }
});

    });
}
}