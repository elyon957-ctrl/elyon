import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';

@Component({
  selector: 'app-offer',
  imports: [MdbCarouselModule,FormsModule,MdbCollapseModule],
  templateUrl: './offer.html',
  styleUrl: './offer.scss',
})
export class Offer implements OnInit{

    private firestore=inject(FirestoreService)
  private fb = inject(FormBuilder);
  private router = inject(Router);

Nav:any[] =[];
products:any[] =[];
tabs:any[] =[];
activeTab="Men's";

ngOnInit(): void {
   this.getNav();
   this.getProducts();
  }

  getNav(){
    this.firestore.getList('Nav').subscribe({
        next: (data: any[]) => {
          this.Nav = data[0].nav;
          this.tabs = data[0].sub
          console.log('Fetching products for nav :',data);
        },
        error: (err: any) => {
          console.error(' Error fetching nav:', err);
        }
      });
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

onUnitChange(item: any, event: Event) {
  const index = +(event.target as HTMLSelectElement).value;
  const unit = item.units[index];
  item.selectedUnitIndex = index;
  item.selectedPrice = unit.price;
  item.selectedActualPrice = unit.actualPrice;
  item.discount = this.calcDiscount(unit.price, unit.actualPrice);
}
calcDiscount(price: number, actual: number): number {
  if (!actual || !price) return 0;
  return Math.round(((actual - price) / actual) * 100);
}

}
