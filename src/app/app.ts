import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { AuthService } from './services/auth.service';
import { Nav } from "./components/nav/nav";
import { AuthModalComponent } from "./components/auth-modal/auth-modal";
import { Footer } from "./components/footer/footer";
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Nav, AuthModalComponent, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'Elyon';

   private auth = inject(Auth);
  private authService = inject(AuthService);
  private router = inject(Router);

  islogin = false;
  isloading = true;

  constructor() {
    this.isloading = true;
    authState(this.auth).subscribe(async (user) => {
      if (user) {
        const userDetails: any = await this.authService.setUser(user.uid);
        this.authService.userDetails = userDetails;
        this.islogin = true;
          this.router.navigate(['/mens'], { replaceUrl: true });
      } else {
        this.islogin = false;
        this.router.navigate(['/login'], { replaceUrl: true });
      }

      this.isloading = false;
    });
  }
}


