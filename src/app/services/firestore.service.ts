import { Injectable, Injector ,runInInjectionContext } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  collection,
  collectionData,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  DocumentReference,
  CollectionReference,
  collectionGroup,
  serverTimestamp
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { AuthService } from './auth.service';
import { set } from '@angular/fire/database';

export interface CartItem {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  added: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  getCollectionGroup(arg0: string) {
    throw new Error('Method not implemented.');
  }
  filter(arg0: (item: any) => boolean): FirestoreService {
    throw new Error('Method not implemented.');
  }
  private authService?: AuthService;

  constructor(private firestore: Firestore, private injector: Injector) {
     setTimeout(() => {
      this.authService = this.injector.get(AuthService);
    });
  }

  set(path: string, data: any) {
    const ref = doc(this.firestore, path);
    return setDoc(ref, data, { merge: true });
  }


   get(path: string): Observable<any> {
    return runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, path);
      return docData(ref, { idField: 'id' });
    });
  }

  add(data: any, path: string) {
    const ref = collection(this.firestore, path);
    return addDoc(ref, data);
  }

  getList(
    path: string,
    filters?: { field: string; op: any; value: any }[],
    orderField?: string,
    limitCount?: number
  ): Observable<any[]> {
    const ref = collection(this.firestore, path);
    let q: any = ref;
    if (filters && filters.length > 0) {
      filters.forEach(f => {
        q = query(q, where(f.field, f.op, f.value));
      });
    }
    if (orderField) {
      q = query(q, orderBy(orderField, 'desc'));
    }

    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }


  delete(id: string, path: string) {
    const ref = doc(this.firestore, path, id);
    return deleteDoc(ref)
  }

  update(item: any, path: string) {
    const ref = doc(this.firestore, path);
    return updateDoc(ref, item);

  }
  
}
