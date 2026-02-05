import { Component, inject, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../../services/firestore.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-add',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-add.html',
  styleUrl: './category-add.scss',
})
export class CategoryAdd implements OnInit, OnChanges {

  @Input() editProduct: any = null;

  categoryForm!: FormGroup;
  mode: 'add' | 'edit' = 'add';

  fb = inject(FormBuilder);
  firebase = inject(FirestoreService);

  ngOnInit(): void {
    this.createForm();

    // Only patch if editProduct exists at first load
    if (this.editProduct) {
      this.setupForEdit();
    }
  }

  // This runs every time @Input() editProduct changes!
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editProduct'] && this.categoryForm) {
      if (this.editProduct) {
        this.setupForEdit();
      } else {
        this.setupForAdd();
      }
    }
  }

  private createForm(): void {
    this.categoryForm = this.fb.group({
      categorie: ['', Validators.required],
      image1: ['', Validators.required],
      image2: ['', Validators.required],
      name: ['', Validators.required],
      type: ['', Validators.required],
    });
  }

  private setupForEdit(): void {
    this.mode = 'edit';
    this.categoryForm.patchValue({
      categorie: this.editProduct.categorie,
      image1: this.editProduct.image1,
      image2: this.editProduct.image2,
      name: this.editProduct.name,
      type: this.editProduct.type,
    });
  }

  private setupForAdd(): void {
    this.mode = 'add';
    this.categoryForm.reset();
    this.categoryForm.get('ProductCategory')?.setValue('');
  }

  onSubmit() {
    if (!this.categoryForm.valid) {
      this.categoryForm.markAllAsTouched();
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please fill all fields correctly!' });
      return;
    }

    const formValue = this.categoryForm.value;

    if (this.mode === 'edit' && this.editProduct?.id) {
      this.firebase.update(formValue, `ProductCategory/${this.editProduct.id}`).then(() => {
        Swal.fire({ icon: 'success', title: 'Updated!', toast: true, position: 'top-end', timer: 1500 });
      });
    } else {
      this.firebase.add(formValue, 'ProductCategory').then(() => {
        Swal.fire({ icon: 'success', title: 'Added!', toast: true, position: 'top-end', timer: 1500 });
        this.categoryForm.reset();
        this.categoryForm.get('ProductCategory')?.setValue('');
      });
    }
  }
}