import { Component, inject, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../../services/firestore.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-add.html',
  styleUrl: './product-add.scss'
})
export class ProductAdd implements OnInit, OnChanges {

  @Input() editProduct: any = null;

  productForm!: FormGroup;
  mode: 'add' | 'edit' = 'add';
  isloading =false
  fb = inject(FormBuilder);
  firebase = inject(FirestoreService);
  Users: any;

  ngOnInit(): void {
    this.createForm();
    this.getCategoryProducts(); 
    this.getColors(); 
    // Only patch if editProduct exists at first load
    if (this.editProduct) {
      this.setupForEdit();
    }
  }

  // This runs every time @Input() editProduct changes!
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editProduct'] && this.productForm) {
      if (this.editProduct) {
        this.setupForEdit();
      } else {
        this.setupForAdd();
      }
    }
  }
 productCategories: any[] = []
 colors: any[] = []

  getCategoryProducts() {
  this.firebase.getList('ProductCategory').subscribe({
      next: (data) => {
        this.productCategories = data 
        console.log(' Product Categories fetched:', this.productCategories);
      },
      error: (err) => {
        console.error(' Error fetching products:', err);
      }
    });
  }
  getColors() {
  this.firebase.getList('Colors').subscribe({
      next: (data) => {
        this.colors = data[0].color 
        console.log(' Product Categories fetched:', this.productCategories);
      },
      error: (err) => {
        console.error(' Error fetching products:', err);
      }
    });
  }

  private createForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      categorytype: ['', Validators.required],
      color: ['', Validators.required],
      image: ['', Validators.required],
      image2: ['', Validators.required],
      image3: ['', Validators.required],
      image4: ['', Validators.required],
      discount: [''],
      offer: [false],
       units: this.fb.array([])
    });
     this.addUnit();
  }
get units(): FormArray {
    return this.productForm.get('units') as FormArray;
  }

  createUnit(unit?: any): FormGroup {
    return this.fb.group({
      label: [unit?.label || '', Validators.required],
      price: [unit?.price || '', Validators.required],
      actualPrice: [unit?.actualPrice || '', Validators.required]
    });
  }

  addUnit(unit?: any) {
    this.units.push(this.createUnit(unit));
  }

  removeUnit(i: number) {
    if (this.units.length > 1) {
      this.units.removeAt(i);
    }
  }

  private setupForEdit(): void {
    this.mode = 'edit';
    this.productForm.patchValue({
     name: this.editProduct.name,
      category: this.editProduct.category,
      categorytype: this.editProduct.categorytype,
      color: this.editProduct.color,
      image: this.editProduct.image,
      image2: this.editProduct.image2,
      image3: this.editProduct.image3,
      image4: this.editProduct.image4,
      discount: this.editProduct.discount,
      offer: this.editProduct.offer,
    });
        this.units.clear();
    this.editProduct.units?.forEach((u: any) => this.addUnit(u));
  }

  private setupForAdd(): void {
    this.mode = 'add';
    this.productForm.reset();
    this.productForm.get('productCategory')?.setValue('');
  }

  onSubmit() {
    if (!this.productForm.valid) {
      this.productForm.markAllAsTouched();
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please fill all fields correctly!' });
      return;
    }

    const formValue = this.productForm.value;

    if (this.mode === 'edit' && this.editProduct?.id) {
      this.firebase.update(formValue, `Products/${this.editProduct.id}`).then(() => {
        Swal.fire({ icon: 'success', title: 'Updated!', toast: true, position: 'top-end', timer: 1500 });
      });
    } else {
      this.firebase.add(formValue, 'Products').then(() => {
        Swal.fire({ icon: 'success', title: 'Added!', toast: true, position: 'top-end', timer: 1500 });
        this.productForm.reset();
        this.units.clear();
        this.addUnit();
        this.productForm.get('productCategory')?.setValue('');
      });
    }
  }
}