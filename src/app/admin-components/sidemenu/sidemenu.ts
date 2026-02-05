import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  RouterLinkActive,Router } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}
@Component({
  selector: 'app-sidemenu',
  imports: [CommonModule, RouterLinkActive],
  templateUrl: './sidemenu.html',
  styleUrl: './sidemenu.scss'
})
export class Sidemenu {
  router=inject(Router)
 navItems: NavItem[] = [
   { label: 'Banner', icon: '🖼️', path: '/banner' },
   { label: 'Category', icon: '📋', path: '/category' },
    { label: 'Products', icon: '🛢️', path: '/products' },
    { label: 'Orders', icon: '📦', path: '/orders' },

  ];
  nav(path: string) {
    this.router.navigate([`adminhome${path}`]);
}

isMenuOpen: boolean = false;

}
