import { Injectable } from '@angular/core';
import { FuseAlertService, FuseAlertType } from '@fuse/components/alert';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: ''
  };

  constructor(private _fuseAlertService: FuseAlertService) {
    this.dismiss('alertBox')
  }


  private dismiss(name: string): void {
    this._fuseAlertService.dismiss(name);
  }

  private show(name: string): void {
    this._fuseAlertService.show(name);
  }


  showAlertMessage(type: FuseAlertType, message?: string) {
    this.alert = {
      type: type,
      message: message || 'Ocurrio un error inesperado, consulte con el administrador!'
    };
    this.show('alertBox')
  }

  hideAlertMessage() {
    this.dismiss('alertBox')
  }

  showSweetAlertSuccess(message: string) {
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 1500
    })
  }

  showMessageConfigAlert(type: FuseAlertType, message?: string) {
    this.alert = {
      type: type,
      message: message || 'Ocurrio un error inesperado, consulte con el administrador!'
    };
    this.show('alertBoxDialog')
  }

  hideMessageConfigAlert() {
    this.dismiss('alertBoxDialog')
  }

}
