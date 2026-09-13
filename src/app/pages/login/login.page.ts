import { Component } from '@angular/core';
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
    private alertController: AlertController) {}

  registrarUsuario() {
    this.router.navigateByUrl('/auth/login/registrar');
  }
  onSubmit(form: NgForm){
    if (form.invalid) {
      return;
    }
    this.crud.logear(this.login, 'usuario/login').subscribe((resp: any)=>{
      localStorage.setItem('usuario', JSON.stringify(resp));
      localStorage.setItem('tipo', resp.tipoUsuario || '');
      this.router.navigateByUrl('/auth/partidos');
    },async err => {
      const alert = await  this.alertController.create({
        header: err.error?.message || 'No se pudo iniciar sesión',
        buttons: ['Aceptar'],
      });
      await alert.present();
    })
  }
}
