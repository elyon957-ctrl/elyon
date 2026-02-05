import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { NgxPaginationModule } from 'ngx-pagination';


@Component({
  selector: 'app-orders2',
  imports: [CommonModule, FormsModule,ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class AllOrders {
  searchTerm = signal('');
  searchTermAuto = signal('');
  selectedStatus = signal('');
  selectedPaymentStatus = signal('');
  totalOrders:any = 0;
  Orders: any =[];
  Users: any = [];
  isloading =true;
  currentPage = 1;
  itemsPerPage = 5;

// filteredOrders:any[]=[];

router = inject(Router);
private formbuild = inject(FormBuilder);
private firestoreService= inject(FirestoreService);
private route= inject(ActivatedRoute);
private auth= inject(AuthService);
constructor(){
  effect(() => {

    this.searchTerm();
    this.searchTermAuto();
    this.selectedStatus();
    this.selectedPaymentStatus();

    this.currentPage =1;
    this.loadOrdersPage(1);

  });
}

ngOnInit(): void {
  // this.getuser().then(()=>{this.getOrders()})
   this.firestoreService.countOrders().subscribe((total: number) => {
      this.totalOrders = total;
    });
    this.loadOrdersPage(this.currentPage);
}

getuser(){
  return new Promise<void>((resolve, reject) => {
    this.firestoreService.getList('Users').subscribe((data: any)=>{
      this.Users = data;
      console.log(data)
      resolve(data)
    })
  })
}

getOrders() {
  return new Promise<void>((resolve, reject) => {
    const orderPromises = this.Users.map((user:any) => {
      return new Promise<void>((resolveUser ) => {
        this.firestoreService.getList(`Users/${user.id}/OrderPlaced`).subscribe((data: any) => {
          const ordersWithUser  = data.map((Orders: any) => ({
            ...Orders,
            userName: user.name,
            userId: user.id
          }));
          this.Orders.push(...ordersWithUser ); // Spread operator to flatten the array
          resolveUser ();
          this.totalOrders=this.Orders.length;
        });
      });
    });

    Promise.all(orderPromises).then(() => {
        this.isloading=false
      //  this.filteredOrders = [...this.Orders];

      resolve();
    });
  });
}



  saveStatus(item: any, status: string) {
    console.log(status);
    console.log(item);
    item.paymentStatus = status
    console.log(item);
    let userid = this.auth.userDetails?.id
    this.firestoreService.update(item,`Users/${userid}/OrderPlaced/${item.id}`)
  }

  get filteredOrders(): any[] {
    return this.Orders;
  }

  formatPrice(price: number): string {
    return 'Rs' + price.toFixed(2);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return ' Pending';
      case 'Process':
        return '⏳ Process';
      case 'Quality Check':
        return '⚙️ Quality Check';
      case 'Order Dispatched':
        return '📦 Order Dispatched';
      case 'Delivered':
        return '✓ Delivered';
      case 'cancelled':
        return '✗ Cancelled';
      default:
        return status;
    }
  }

  getPaymentLabel(paymentStatus: string): string {
    switch (paymentStatus) {
      case 'Paid':
        return '✓ Paid';
      default:
        return paymentStatus;
    }
  }

  countByStatus(paymentStatus: string): number {
    return this.Orders.filter((order:any) => order.paymentStatus === paymentStatus).length;
  }

  calculateTotalRevenue(): number {
    return this.Orders
      .filter((order:any) => order.paymentStatus === 'paid')
      .reduce((sum:any, order:any) => sum + order.total, 0);
  }

loadOrdersPage(page: number) {
  this.isloading = true;

  const paymentStatus = this.selectedStatus() || '';
  const payment = this.selectedPaymentStatus() || '';
  const search = this.searchTerm() || undefined;
  const searchAuto = this.searchTermAuto() || undefined;

  this.firestoreService
    .countOrders(paymentStatus, payment,search)
    .subscribe({
      next: (count: number) => {
        this.totalOrders = count;

        this.firestoreService
          .getOrdersPage({
            page,
            limit: this.itemsPerPage,
            paymentStatus,
            payment,
            search,
            searchAuto
          })
          .subscribe({
            next: (orders: any[]) => {
              console.log('orders page', page, orders);
              this.Orders = orders;
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
  if (this.totalOrders === 0) return 0;
  return (this.currentPage - 1) * this.itemsPerPage + 1;
}

get showingTo(): number {
  if (this.totalOrders === 0) return 0;
  const maxForPage = this.currentPage * this.itemsPerPage;
  return Math.min(maxForPage, this.totalOrders);
}
onSearch(searchText: string) {
  this.searchTerm.set(searchText);
  this.loadOrdersPage(1);
}
onSearchAuto(searchText: string) {
  this.searchTermAuto.set(searchText); 
  this.loadOrdersPage(1);
}
}
