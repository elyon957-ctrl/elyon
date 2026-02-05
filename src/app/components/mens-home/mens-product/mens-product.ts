import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FirestoreService } from '../../../services/firestore.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
declare var bootstrap: any;

@Component({
  selector: 'app-mens-product',
  imports: [FormsModule,RouterModule],
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
isLoggedIn = false;
Categories: any;
ngOnInit(): void {
  this.auth.isLoggedIn$.subscribe(status => {
    this.isLoggedIn = status;
    console.log(status)
  });
  this.Categories = history.state.Categories;
  this.getProducts()
  this.getColor()
  }
    color:any[] =[]
   getColor(){
    this.firestore.getList("Colors").subscribe((data:any[])=>{
      this.color =data[0].color
    })
  }

onColorChange(color: any) {
  console.log('Selected color:', color);
  // filter products here
}
getProducts() {
  this.firestore.getList('Products').subscribe((data: any[]) => {
    this.products = data.map(product => {
      // find M size unit
      const defaultUnit =
        product.units?.find((u: any) => u.label === 'M') ||
        product.units?.[0]; // fallback if M not found

      return {
        ...product,
        selectedUnit: defaultUnit,
        selectedPrice: defaultUnit?.price,
        selectedActualPrice: defaultUnit?.actualPrice,
        selectedUnitLabel: defaultUnit?.label
      };
    });
  });
}


openProduct(product: any) {
  this.router.navigate(['/mensproductview', product.id],{
      state: { product }}
  )
}

showFilter = false;

toggleFilter() {
  this.showFilter = !this.showFilter;
}
   navto(path: string) {
    this.router.navigate([`/${path}`]);
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
