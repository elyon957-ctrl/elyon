import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';

import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { MdbModalModule, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { CommonModule } from '@angular/common';

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


  Banner: any[]            = [];
  isLoggedIn               = false;
  userId: any;
  promobanner: any;
  productCategories: any[] = [];
   isloading = true;

  ngOnInit(): void {
    this.isloading = false;
    this.auth.isLoggedIn$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
    });
    this.userId = this.auth.userDetails?.id;
    this.getBanner();
    this.getCategoryProducts();
  }
  
  
  getBanner() {
    this.firestore.getList('TopBanner').subscribe({
      next: (data: any[]) => { this.Banner = data; 
        this.isloading = true;
      },
      error: (err: any)   => { console.error('Banner error:', err); }
    });
  }

 getCategoryProducts() {
    this.firestore.getList('ProductCategory').subscribe({
      next: (data) => { this.productCategories = data; },
      error: (err) => { console.error('ProductCategory error:', err); }
    });
  }
  openProduct(Categories: any) {
    this.router.navigate(['/mensproduct', Categories.id], {
      state: { Categories }
    });
  }


  scrollTrending(direction: number) {
    const track = this.trendingTrack.nativeElement;
    const card  = track.querySelector('.trending__card') as HTMLElement | null;
    if (!card) return;

    const cardWidth = card.offsetWidth + 20; 
    track.scrollLeft += direction * cardWidth;
  }
}