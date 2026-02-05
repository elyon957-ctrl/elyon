import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { Sidemenu } from "../sidemenu/sidemenu";

interface NavItem {
  label: string;
  icon: string;
  path: string;
}
@Component({
  selector: 'app-home',
  imports: [RouterOutlet, Sidemenu],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class AdminHome {

}
