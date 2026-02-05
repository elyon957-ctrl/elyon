import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard.service';
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

import { AdminHome } from './admin-components/home/home';

import { ProductsComponent } from './admin-components/products-component/products-component';
import { AllOrders } from './admin-components/orders/orders';
import { Category } from './admin-components/category/category';
import { Wishlist } from './components/wishlist/wishlist';
import { Banner } from './admin-components/banner/banner';



export const routes: Routes = [
    {path:'login',component:AuthModalComponent,canActivate:[authGuard]},

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
    { path:'wishlist',component:Wishlist},


  

    {path:'adminhome',component:AdminHome,canActivate:[authGuard],children:[
            { path: 'products', component: ProductsComponent },
            { path: 'orders', component: AllOrders },
            { path: 'category', component: Category },
            { path: 'banner', component: Banner },
        ]
    },
    { path: '', redirectTo: '/mens', pathMatch: 'full' },
];
