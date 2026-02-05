import { Component, inject, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../../services/firestore.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-banner',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-banner.html',
  styleUrl: './add-banner.scss',
})
export class AddBanner implements OnInit, OnChanges {

  @Input() editbanner: any = null;

  bannerForm!: FormGroup;
  mode: 'add' | 'edit' = 'add';

  fb = inject(FormBuilder);
  firebase = inject(FirestoreService);

  ngOnInit(): void {
    this.createForm();

    // Only patch if editProduct exists at first load
    if (this.editbanner) {
      this.setupForEdit();
    }
  }

  // This runs every time @Input() editProduct changes!
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editbanner'] && this.bannerForm) {
      if (this.editbanner) {
        this.setupForEdit();
      } else {
        this.setupForAdd();
      }
    }
  }

  private createForm(): void {
    this.bannerForm = this.fb.group({
      category: ['', Validators.required],
      url: ['', Validators.required],
    });
  }

  private setupForEdit(): void {
    this.mode = 'edit';
    this.bannerForm.patchValue({
      category: this.editbanner.category,
      url: this.editbanner.url
    });
  }

  private setupForAdd(): void {
    this.mode = 'add';
    this.bannerForm.reset();
    this.bannerForm.get('TopBanner')?.setValue('');
  }

  onSubmit() {
    if (!this.bannerForm.valid) {
      this.bannerForm.markAllAsTouched();
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please fill all fields correctly!' });
      return;
    }

    const formValue = this.bannerForm.value;

    if (this.mode === 'edit' && this.editbanner?.id) {
      this.firebase.update(formValue, `TopBanner/${this.editbanner.id}`).then(() => {
        Swal.fire({ icon: 'success', title: 'Updated!', toast: true, position: 'top-end', timer: 1500 });
      });
    } else {
      this.firebase.add(formValue, 'TopBanner').then(() => {
        Swal.fire({ icon: 'success', title: 'Added!', toast: true, position: 'top-end', timer: 1500 });
        this.bannerForm.reset();
        this.bannerForm.get('TopBanner')?.setValue('');
      });
    }
  }
}