import { Component } from '@angular/core';
import { AlertController, IonInput } from '@ionic/angular';
import { ExtraerInfService } from 'src/app/services/extraer-inf.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CrudService } from 'src/app/services/crud.service';
import { Usuario } from 'src/models/Usuario';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false
})
export class Tab3Page {
  imagenDef = "../../../assets/icon/usuario.png";
  foto: any;
  identificacion: any;
  usuario: Usuario = new Usuario();
  confirmarContrasena: string = "";
  url: string = "";
  constructor(private router: Router, private crud: CrudService, public extraer: ExtraerInfService,
          private alertController: AlertController) {
    this.url =  router.url
  }
  textoBtnSubmit(): string {
    if (this.url == '/tabs/tab3') {
      return "Editar"
    } else if (this.url == '/auth/login/registrar') {
      return "Registrar"
    } 
    return "";
  }
  async onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    if (this.usuario.contrasena != this.confirmarContrasena) {
      const alert = await  this.alertController.create({
        header: 'Las contraseñas no son iguales',
        buttons: ['Aceptar'],
      });
      await alert.present();
      return;
    }
    if (this.url == '/tabs/tab3') {
      this.crud.actualizarArchivo(this.usuario,'usuario', this.foto).subscribe(async (resp) =>{
        this.usuario = resp;
        const alert = await  this.alertController.create({
          header: 'Informacion usuario actulizada',
          buttons: ['Aceptar'],
        });
        await alert.present();
      });
    } else if (this.url == '/auth/login/registrar') {
      this.crud.crearUsuario(this.usuario,'usuario', this.foto, this.identificacion).subscribe(async (resp) =>{
        this.usuario = resp;
        const alert = await  this.alertController.create({
          header: 'Usuario Creado',
          buttons: ['Aceptar'],
        });
        let elemeto: any = document.getElementsByClassName('back-button-has-icon-only')[0];
        elemeto.click();
        await alert.present();
      });
    } 
  }
  validarBackBtn() {
    return this.url == '/auth/login/registrar';
  }
  activarSubirArchivo(elemtIon: IonInput){
    let btnFile: any = elemtIon["el"].children[0];
    btnFile.click();
  }
  cargarImg(input: Event) {
    let elemetHTML: any = input.target;
    if (elemetHTML.files.length > 0) {
      this.foto = elemetHTML.files[0];
      this.imagenDef = URL.createObjectURL(this.foto);
    }
  }
  cerrarSesion() {
    sessionStorage.clear();
    this.router.navigateByUrl('auth');
  }
}
