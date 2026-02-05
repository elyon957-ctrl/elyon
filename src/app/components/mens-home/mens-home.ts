import { Component, inject, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';

import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { MdbModalModule, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
declare var bootstrap: any;
@Component({
  selector: 'app-mens-home',
  imports: [MdbCarouselModule, FormsModule, MdbCollapseModule, MdbModalModule, CommonModule],
  templateUrl: './mens-home.html',
  styleUrl: './mens-home.scss',
})
export class MensHome implements OnInit {


  @ViewChild('trendingTrack') trendingTrack!: ElementRef<HTMLDivElement>;


  private firestore  = inject(FirestoreService);
  private auth       = inject(AuthService);
  private fb         = inject(FormBuilder);
  private router     = inject(Router);
  private modalService = inject(MdbModalService); 

  private route = inject(ActivatedRoute);



  Banner: any[]            = [];
  isLoggedIn               = false;
  userId: any;
  promobanner: any;
  productCategories: any[] = [];
   isloading = false;
   products: any[] = [];

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.isloading = true;
      console.log('Route params:', params);
      this.userId = this.auth.userDetails?.id;
      console.log('User ID:', this.userId);
      await this.getBanner();
      await this.getCategoryProducts();
      await this.getProduct();
      await this.loadHeroBanners();
      
      this.isloading = false;
    });
  }
  
   @Input() product!: any;

  isWishlisted = false;


  getBanner() {
    return new Promise<void>((resolve, reject) => {
      this.firestore.getList('TopBanner').subscribe({
        next: (data: any[]) => { 
          this.Banner = data; 
          console.log('Banner data:', data);
          resolve();
        },
        error: (err: any)   => { 
          console.error('Banner error:', err);
          reject(err);
        }
      });
    }) 
  }
mensHeroBanners: any[] = [];

loadHeroBanners() {
  // 1️⃣ filter mens banners
  const mensBanners = this.Banner.filter(
    (b: any) => b.category === 'Men'
  );

  // 2️⃣ shuffle
  const shuffled = [...mensBanners].sort(() => 0.5 - Math.random());

  // 3️⃣ take 2
  this.mensHeroBanners = shuffled.slice(0, 2);
}

getProduct() {
  return new Promise<void>((resolve, reject) => {
    this.firestore.getList('Products').subscribe({
      next: (data: any[]) => {
        const normalized = data.map(product => {
          const defaultUnit =
            product.units?.find((u: any) => u.label === 'M') ||
            product.units?.[0];

          return {
            ...product,
            selectedUnit: defaultUnit,
            selectedUnitLabel: defaultUnit?.label,
            selectedPrice: defaultUnit?.price,
            selectedActualPrice: defaultUnit?.actualPrice
          };
        });

        this.products = this.getRandomProducts(normalized, 4);

        resolve();
      },
      error: (err: any) => {
        console.error('products error:', err);
        reject(err);
      }
    });
  });
}

getRandomProducts(list: any[], count: number) {
  return [...list]
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
}


 getCategoryProducts() {
  return new Promise<void>((resolve, reject) => {
    this.firestore.getList('ProductCategory').subscribe({
      next: (data) => { this.productCategories = data; resolve(); },
      
      error: (err) => { console.error('ProductCategory error:', err); reject(err);  }
    });
  })
}
  openProduct(Categories: any) {
    this.router.navigate(['/mensproduct', Categories.id], {
      state: { Categories }
    });
  }
addProduct(item: any) {
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