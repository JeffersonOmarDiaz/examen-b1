import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Observable } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import { FirestorageService } from 'src/app/services/firestorage.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  messages: Observable<any[]>;
  newMsg = '';
  newFile ='';
  constructor(private chatService: ChatService, private router: Router,
    public firestorageService: FirestorageService,
    ) { }

  ngOnInit() {
    this.messages = this.chatService.getChatMessages();
  }

  sendMessage() {
    this.chatService.addChatMessage(this.newMsg).then(() => {
      this.newMsg = '';
      this.content.scrollToBottom();
    });
  }
 
  signOut() {
    this.chatService.signOut().then(() => {
      this.router.navigateByUrl('/', { replaceUrl: true });
    });
  }


  async newImageUpload(event: any) {
    console.log('el evento es: ',event);
    if (event.target.files && event.target.files[0] && event.isTrusted === true) {
      console.log(this.chatService.enviarEmail());
      //const res = await this.firestorageService.uploadImagen(this.newFile, this.pathMascota, name);
      const reader = new FileReader();
      reader.onload = ((image) => {
        //this.newMascota.foto = image.target.result as string;
      });
      reader.readAsDataURL(event.target.files[0]);
    }
    console.log('Fin de la función nuevaImagenUpload');
  
  }
}
