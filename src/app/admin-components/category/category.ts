import { Component, effect, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { CategoryAdd } from './category-add/category-add';


@Component({
  selector: 'app-category',
  imports: [CommonModule, FormsModule,ReactiveFormsModule, NgxPaginationModule,CategoryAdd],
  templateUrl: './category.html',
  styleUrl: './category.scss',
})
export class Category {
  
  @ViewChild(CategoryAdd) categoryAddComponent!: CategoryAdd;

  searchTerm = signal('');
  selectedCategory = signal('');
  totalCategory:any = 0;
  category: any =[];
  Users: any = [];
  isloading =true;
  currentPage = 1;
  itemsPerPage = 5;
   selectedProduct: any = null;


router = inject(Router);
private formbuild = inject(FormBuilder);
private firestoreService= inject(FirestoreService);
private route= inject(ActivatedRoute);
private auth= inject(AuthService);
constructor(){
  effect(() => {

    this.searchTerm();
    this.selectedCategory();

    this.currentPage =1;
    this.loadOrdersPage(1);

  });
}

ngOnInit(): void {

   this.firestoreService.countCategory().subscribe((total: number) => {
      this.totalCategory = total;
    });
    this.loadOrdersPage(this.currentPage);
}


getCategory() {
  return new Promise<void>((resolve, reject) => {
    const orderPromises = this.Users.map((user:any) => {
      return new Promise<void>((resolveUser ) => {
        this.firestoreService.getList(`ProductCategory`).subscribe((data: any) => {
       
       this.category= data;   // Spread operator to flatten the array
          resolveUser ();
          this.totalCategory=this.category.length;
        });
      });
    });

    Promise.all(orderPromises).then(() => {
        this.isloading=false

      resolve();
    });
  });
}

  get filteredCategory(): any[] {
    return this.category;
  }

loadOrdersPage(page: number) {
  this.isloading = true;

  const category = this.selectedCategory() || '';
  const search = this.searchTerm() || undefined;


  this.firestoreService
    .countCategory(category,search)
    .subscribe({
      next: (count: number) => {
        this.totalCategory = count;

        this.firestoreService
          .getCategoryPage({
            page,
            limit: this.itemsPerPage,
            category,
            search,
          })
          .subscribe({
            next: (orders: any[]) => {
              console.log('orders page', page, orders);
              this.category = orders;
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
  this.loadOrdersPage(page);
}

get showingFrom(): number {
  if (this.totalCategory === 0) return 0;
  return (this.currentPage - 1) * this.itemsPerPage + 1;
}

get showingTo(): number {
  if (this.totalCategory === 0) return 0;
  const maxForPage = this.currentPage * this.itemsPerPage;
  return Math.min(maxForPage, this.totalCategory);
}

onSearch(searchText: string) {
  this.searchTerm.set(searchText);
  this.loadOrdersPage(1);
}

 remove(id: string) {
    const userId = this.auth.userDetails?.id;
    if (!userId || !id) return;

    this.firestoreService.delete(id, `ProductCategory`)
      .then(() => console.log(' Item removed from Firestore'))
      .catch(err => console.error('Error removing item:', err));
  }
  
  openModal(product?: any) {
    this.selectedProduct = product
    if (!product) {
      this.categoryAddComponent?.categoryForm.reset();
      this.categoryAddComponent!.mode = 'add';
    }

    const modalEl = document.getElementById('myModal');
    const modal = new (window as any).bootstrap.Modal(modalEl);
    modal.show();
  }

  saveProduct() {
    this.categoryAddComponent.onSubmit();
    this.closeModal();
    this.selectedProduct = null;
    this.getCategory();
  }

  closeModal() {
    this.selectedProduct = null;
    this.categoryAddComponent?.categoryForm.reset();
    this.categoryAddComponent!.mode = 'add';

    const modalEl = document.getElementById('myModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }

}
