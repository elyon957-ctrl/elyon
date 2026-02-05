import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FirestoreService } from './firestore.service';
import Swal from 'sweetalert2';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private auth = inject(Auth);

  user$ = authState(this.auth);

  isLoggedIn$ = this.user$.pipe(
    map(user => !!user)
  );
setUser(uid:any){
    return new Promise((resolve, reject)=>{
      this.fireService.get(`Users/${uid}`).subscribe({
        next: (userData) => {
         this.userDetails = userData;
         resolve(userData)
        },

       })
    })
  }
  userDetails: any;

  constructor(
    private router: Router,
    private fireService: FirestoreService
  ) {}

  async login(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      this.fireService.get(`Users/${result.user.uid}`).subscribe((userData) => {
        console.log('User Data:', userData);
            this.router.navigate(['/mens']);
          this.userDetails = userData;
          console.log("hit",userData)
          localStorage.setItem('user', JSON.stringify(userData))
          this.userDetails = userData;
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: (error as Error).message,
      });
    }
  }


 async register(email: string, password: string, name: string,gender:string,role?:string) {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      const userData: any = {
        email: result.user.email,
        name: name,       
        id: result.user.uid,
        gender: gender,       
        role: role ??  'User'
      }
      this.userDetails = userData;
      localStorage.setItem('user', JSON.stringify(userData))
      this.router.navigate(['/mens']);
      await this.fireService.set(`Users/${result.user.uid}`, userData);
      this.userDetails = userData;
      return userData
    } catch (error) {
      Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: (error as Error).message,
      });return null;
    }
  }

  logout() {
    localStorage.removeItem('user'); 
    return signOut(this.auth);
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }
   isLoggedIn(): boolean {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    return user !== null ? true : false;
  }
}
