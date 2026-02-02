import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { adminGuard } from './services/auth.guard.service';
import { Offer } from './components/offer/offer';
import { Cart } from './components/cart/cart';
import { Address } from './components/cart/address/address';
import { Payment } from './components/cart/payment/payment';
import { Order } from './components/order/order';

import { MensHome } from './components/mens-home/mens-home';
import { MensProductView } from './components/mens-home/mens-product-view/mens-product-view';
import { MensProduct } from './components/mens-home/mens-product/mens-product';
import { WomensHome } from './components/womens-home/womens-home';
import { WomensProduct } from './components/womens-home/womens-product/womens-product';
import { WomensProductView } from './components/womens-home/womens-product-view/womens-product-view';
import { KidsHome } from './components/kids-home/kids-home';
import { KidsProductView } from './components/kids-home/kids-product-view/kids-product-view';
import { KidsProduct } from './components/kids-home/kids-product/kids-product';
import { AuthModalComponent } from './components/auth-modal/auth-modal';


export const routes: Routes = [
    {path:'login',component:AuthModalComponent,canActivate:[adminGuard]},

    {path:'mens',component:MensHome},
    {path:'mensproduct/:id',component:MensProduct},
    {path:'mensproductview/:id',component:MensProductView},

    {path:'womens',component:WomensHome},
    {path:'womensproduct/:id',component:WomensProduct},
    {path:'womensproductview/:id',component:WomensProductView},
    
    {path:'kids',component:KidsHome},
    {path:'kidsproduct/:id',component:KidsProduct},
    {path:'kidsproductview/:id',component:KidsProductView},

    {path:'todaydeals',component:Offer},
    {path:'orders',component:Order},
    { path:'cart',component:Cart},
     { path:'address',component:Address},
    { path:'payment',component:Payment},

    { path: '', redirectTo: '/mens', pathMatch: 'full' },
];
