import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud.service';
import { Login } from 'src/models/Login';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  login: Login = new Login();
  constructor(private router: Router, private crud: CrudService,
    private alertController: AlertController, private http: HttpClient) {
    this.http.get("https://jsonplaceholder.typicode.com/users").subscribe((resp: any) =>{
      this.login.identificacion = resp[0].name
    });
  }

  registrarUsuario() {
    this.router.navigateByUrl('auth/login/registrar');
  }
  onSubmit(form: NgForm){
    if (form.invalid) {
      return;
    }
    this.crud.logear(this.login, 'usuario/login').subscribe((resp)=>{
      this.router.navigateByUrl('tabs/tab1');
      sessionStorage.setItem('usuario', JSON.stringify(resp));
    },async err => {
      const alert = await  this.alertController.create({
        header: err.error.message,
        buttons: ['Aceptar'],
      });
      await alert.present();
    })
  }
}
