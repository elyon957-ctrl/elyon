
import { Component, inject, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { FormBuilder,FormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
// import { Login } from '../login/login';
import { MdbModalModule, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { AuthModalComponent } from '../auth-modal/auth-modal';

@Component({
  selector: 'app-kids-home',
  imports: [MdbCarouselModule,FormsModule,MdbCollapseModule,MdbModalModule],
  templateUrl: './kids-home.html',
  styleUrl: './kids-home.scss',
})
export class KidsHome implements OnInit {

  private firestore=inject(FirestoreService)
  private auth=inject(AuthService)
  private fb = inject(FormBuilder);
  private router = inject(Router);
 private modalService =inject(MdbModalService);
Banner: any[] =[{}];
products:any[] =[];
tabs:any[] =[];
name:any;
isLoggedIn = false;
userId:any
quantity: number = 1; 

  ngOnInit(): void {
   this.auth.isLoggedIn$.subscribe(status => {
    this.isLoggedIn = status;
    console.log(status)
  });
  this.userId=this.auth.userDetails?.id;
    this.getBanner();
   this.getProducts();
   this.getCategoryProducts();
  }
  getBanner(){
    this.firestore.getList('Banner').subscribe({
        next: (data: any[]) => {
          this.Banner = data;
          console.log('Fetching products for Banner :',data);
        },
        error: (err: any) => {
          console.error(' Error fetching Banner:', err);
        }
      });
      this.firestore.getList('Nav').subscribe((data: any[]) => {
      this.tabs = data[0].sub  
      })
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
  });
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
calcDiscount(price: number, actual: number): number {
  if (!actual || !price) return 0;
  return Math.round(((actual - price) / actual) * 100);
}
 openLoginModal() {
    this.modalService.open(AuthModalComponent, {
      modalClass: 'modal-dialog-centered'
    });
  }
openProduct(product: any) {
  this.router.navigate(['/productoverview', product.id],{
      state: { product }}
  )
}

  productCategories: any[] = []

  getCategoryProducts() {
  this.firestore.getList('ProductCategory').subscribe({
      next: (data) => {
        this.productCategories = data 
        console.log(' Product Categories fetched:', this.productCategories);
      },
      error: (err) => {
        console.error(' Error fetching products:', err);
      }
    });
  }

}
