import { Component, effect, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProductAdd } from './product-add/product-add';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';



@Component({
  selector: 'app-products-component',
  imports: [CommonModule, FormsModule, NgSelectModule,NgxPaginationModule, ProductAdd],
  templateUrl: './products-component.html',
  styleUrl: './products-component.scss'
})
export class ProductsComponent {

  @ViewChild(ProductAdd) productAddComponent!: ProductAdd;

  constructor(
    private firestoreService: FirestoreService,
    private router: Router,
    private authService: AuthService,
    
    private route: ActivatedRoute
    
  ) { effect(() => {

    this.searchTerm();
    this.selectedCategory();

    this.currentPage =1;
    this.loadProductsPage(1);

  });}

 searchTerm = signal('');
  selectedCategory = signal('');
  totalProduct:any = 0;
  products: any =[];
  Users: any = [];
  isloading =true;
  currentPage = 1;
  itemsPerPage = 5;
   selectedProduct: any = null;

ngOnInit(): void {

   this.firestoreService.countProducts().subscribe((total: number) => {
      this.totalProduct = total;
    });
    this.loadProductsPage(this.currentPage);
}


getProduct() {
  return new Promise<void>((resolve, reject) => {
    const orderPromises = this.Users.map((user:any) => {
      return new Promise<void>((resolveUser ) => {
        this.firestoreService.getList(`Products`).subscribe((data: any) => {
       
       this.products= data;   // Spread operator to flatten the array
          resolveUser ();
          this.totalProduct=this.products.length;
        });
      });
    });

    Promise.all(orderPromises).then(() => {
        this.isloading=false

      resolve();
    });
  });
}

 get filteredProducts(): any[] {
    return this.products;
  }

loadProductsPage(page: number) {
  this.isloading = true;

  const category = this.selectedCategory() || '';
  const search = this.searchTerm() || undefined;


  this.firestoreService
    .countProducts(category,search)
    .subscribe({
      next: (count: number) => {
        this.totalProduct = count;

        this.firestoreService
          .getProductsPage({
            page,
            limit: this.itemsPerPage,
            category,
            search,
          })
          .subscribe({
            next: (orders: any[]) => {
              console.log('products page', page, orders);
              this.products = orders;
              this.currentPage = page;
              this.isloading = false;
            },
            error: (err) => {
              console.error('Error loading orders page', err);
              this.isloading = false;
            }
          });
      },
      error: (err) => {
        console.error('Error counting orders', err);
        this.isloading = false;
      }
    });
}
onPageChange(page: number) {
  this.loadProductsPage(page);
}

get showingFrom(): number {
  if (this.totalProduct === 0) return 0;
  return (this.currentPage - 1) * this.itemsPerPage + 1;
}

get showingTo(): number {
  if (this.totalProduct === 0) return 0;
  const maxForPage = this.currentPage * this.itemsPerPage;
  return Math.min(maxForPage, this.totalProduct);
}

onSearch(searchText: string) {
  this.searchTerm.set(searchText);
  this.loadProductsPage(1);
}


 remove(id: string) {
    const userId = this.authService.userDetails?.id;
    if (!userId || !id) return;

    this.firestoreService.delete(id, `Products`)
      .then(() => console.log(' Item removed from Firestore'))
      .catch(err => console.error('Error removing item:', err));
  }
  
  openModal(product?: any) {
    this.selectedProduct = product
    if (!product) {
      this.productAddComponent?.productForm.reset();
      this.productAddComponent!.mode = 'add';
    }

    const modalEl = document.getElementById('myModal');
    const modal = new (window as any).bootstrap.Modal(modalEl);
    modal.show();
  }

  saveProduct() {
    this.productAddComponent.onSubmit();
    this.closeModal();
    this.selectedProduct = null;
    this.getProduct();
  }

  closeModal() {
    this.selectedProduct = null;
    this.productAddComponent?.productForm.reset();
    this.productAddComponent!.mode = 'add';

    const modalEl = document.getElementById('myModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }

}
