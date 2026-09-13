import { Component, OnInit } from '@angular/core';
import { CrudService } from '../services/crud.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: false
})
export class AuthPage implements OnInit {

  constructor(private crud: CrudService) { }

  sesionActiva(): boolean {
    return this.crud.verSesion();
  }

  ngOnInit() {
  }

}
