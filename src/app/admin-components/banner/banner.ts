import { Component, effect, inject, OnInit, signal, viewChild, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { AddBanner } from './add-banner/add-banner';


@Component({
  selector: 'app-banner',
  imports: [CommonModule, FormsModule,ReactiveFormsModule, NgxPaginationModule,AddBanner],
  templateUrl: './banner.html',
  styleUrl: './banner.scss',
})
export class Banner implements OnInit {
  @ViewChild(AddBanner) bannnerAddComponent!: AddBanner;
  private firestore =inject(FirestoreService);
  private route= inject(ActivatedRoute);
  private auth= inject(AuthService)
  Banner: any = [];
selectedbanner: any;

  
ngOnInit(): void {
    this.getBanner();
}
getBanner() {
  return new Promise<void>((resolve, reject) => {
    this.firestore.getList('TopBanner').subscribe((data: any) => {
      this.Banner = data;
      resolve();
    }, (error: any) => {
      console.error('Error fetching banner:', error);
      reject(error);
    });
  });
}
  openModal(item?: any) {
    this.selectedbanner = item
    if (!item) {
      this.bannnerAddComponent?.bannerForm.reset();
      this.bannnerAddComponent!.mode = 'add';
    }

    const modalEl = document.getElementById('myModal');
    const modal = new (window as any).bootstrap.Modal(modalEl);
    modal.show();
  }

  saveProduct() {
    this.bannnerAddComponent.onSubmit();
    this.closeModal();
    this.selectedbanner = null;
    this.getBanner();
  }

  closeModal() {
    this.selectedbanner = null;
    this.bannnerAddComponent?.bannerForm.reset();
    this.bannnerAddComponent!.mode = 'add';

    const modalEl = document.getElementById('myModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }
remove(id: string) {
    const userId = this.auth.userDetails?.id;
    if (!userId || !id) return;

    this.firestore.delete(id, `TopBanner`)
      .then(() => console.log(' Item removed from Firestore'))
      .catch(err => console.error('Error removing item:', err));
  }
  
}
