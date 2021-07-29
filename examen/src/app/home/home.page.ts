import { Component, ViewChild, ElementRef, Input } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Ubicacion } from '../modelBD';
import { ChatService } from '../services/chat.service';
import { FirestoreService } from '../services/firestore.service';
import { IonContent } from '@ionic/angular';

declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  visible = false;

  @ViewChild('map', { static: false }) mapElement: ElementRef;
  map: any;
  address: string;

  latitude: number;
  longitude: number;

  ubicacion : Ubicacion = {
    id: this.firestoreService.getId(),
    latitud: '',
    longitud: '',
    direccion: '',
    fecha: new Date()
}
@ViewChild(IonContent) content: IonContent;
newMsg = '';
  constructor(
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    public firestoreService:FirestoreService,
    private chatService: ChatService,) {
  }


  ngOnInit() {
    this.loadMap();
  }

  vaciarCampos(){
    this.visible = false;
  }
  guardarUbicacion(){
    this.visible = true;
    const id = this.ubicacion.id;
    this.ubicacion.latitud = String(this.latitude);
    this.ubicacion.longitud = String(this.longitude);
    //this.ubicacion.direccion = '';
    const path = '/UbicacionesGps';
    console.log('guardarUbicacion() => ', this.ubicacion);
    this.firestoreService.createDoc(this.ubicacion, path, id).then(res => {
      console.log('guardarUbicacion()  ==> ', res);
      let msgInterno = String.prototype.concat("Latitud: ",this.ubicacion.latitud, " Longitud: ", this.ubicacion.longitud);
      this.newMsg = msgInterno;
      this.sendMessage();
    }).catch(error => {
      console.log('No se pudo Actulizar un error ->', error);
      
    });

  }

  sendMessage() {
    this.chatService.addChatMessage(this.newMsg).then(() => {
      this.newMsg = '';
      this.content.scrollToBottom();
    });
  }
  loadMap() {
    this.geolocation.getCurrentPosition().then((resp) => {

      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;

      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      this.map.addListener('dragend', () => {

        this.latitude = this.map.center.lat();
        this.longitude = this.map.center.lng();

        this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng())
      });

    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  getAddressFromCoords(lattitude, longitude) {
    console.log("getAddressFromCoords " + lattitude + " " + longitude);
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };

    this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
      .then((result: NativeGeocoderResult[]) => {
        this.address = "";
        let responseAddress = [];
        for (let [key, value] of Object.entries(result[0])) {
          if (value.length > 0)
            responseAddress.push(value);

        }
        responseAddress.reverse();
        for (let value of responseAddress) {
          this.address += value + ", ";
        }
        this.address = this.address.slice(0, -2);
        this.ubicacion.direccion = this.address;
      })
      .catch((error: any) => {
        this.address = "Address Not Available!";
      });

  }

}
