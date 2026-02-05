import {  Component,OnInit } from '@angular/core';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { FirestoreService } from '../../services/firestore.service';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
declare var bootstrap: any;
@Component({
  selector: 'app-nav',
  imports: [MdbCollapseModule,RouterModule,CommonModule],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
})
export class Nav  implements OnInit {
  constructor(private firestore: FirestoreService,private router: Router,public  auth: AuthService,private route: ActivatedRoute) {}  

cartCount: number =0;
isLoggedIn = false;
Nav:any[] =[];

ngOnInit(){
  this.auth.isLoggedIn$.subscribe(status => {
    this.isLoggedIn = status;
    console.log(status)
  });
this.getNav();
this.getCart();
}
getCart(){
  const userId = this.auth.userDetails?.id;
  this.firestore.getList(`Users/${userId}/Cart`).subscribe({
            next: (cart) => {
              this.cartCount = cart.length;}
})
}
getNav() {
  if(this.isLoggedIn=true){
    const role = this.auth.userDetails?.role; 
    const userId = this.auth.userDetails?.id;
        if (userId) {
          this.firestore.getList(`Users/${userId}/Cart`).subscribe({
            next: (cart) => {
              this.cartCount = cart.length; 
              console.log("hit")
              
            },
            error: (err) => console.error('Error fetching cart:', err)
          });
        }
}else{
   this.firestore.getList('Nav').subscribe({
        next: (data: any[]) => {
          this.Nav = data[0].nav;
          console.log('Fetching products for nav :',data);
        },
        error: (err: any) => {
          console.error(' Error fetching nav:', err);
        }
      });
}
}

   navto(path: string) {
    this.router.navigate([`/${path}`]);
  }
  logout() {
    this.auth.logout();
    this.router.navigate(['/login-page']);
    localStorage.removeItem('user');
  }
  menuOpen = false;

toggleMenu() {
  this.menuOpen = !this.menuOpen;
}

closeMenu() {
  this.menuOpen = false;
}
bar: boolean = false;

searchBar() {
  this.bar = !this.bar;
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

nav = [
    {
      "link": "mens",
      "name": "Men's"
    },
    {
      "link": "womens",
      "name": "Women's"
    },
    {
      "link": "kids",
      "name": "Kids"
    },
    {
      "link": "todaydeals",
      "name": "Today Deals"
    }
  ]
}
