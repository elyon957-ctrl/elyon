import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { FirestoreService } from '../services/firestore.service';
import { switchMap, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const firestore = inject(FirestoreService);

  return authState(auth).pipe(
    switchMap(user => {
      if (!user) {
        return of(router.createUrlTree(['/login']));
      }

      return firestore.get(`Users/${user.uid}`).pipe(
        map((userData: any) => {
          if (userData?.role === 'Admin') {
            return true;
          }
            return router.createUrlTree(['/adminhome']);
        })
      );
    })
  );
};
