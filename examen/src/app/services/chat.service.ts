import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface User {
  uid: string;
  email: string;
}
 
export interface Message {
  createdAt: Date;
  id: string;
  from: string;
  msg: string;
  fromName: string;
  myMsg: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  currentUser: User = null;
  elEmail = "";
  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {
    this.afAuth.onAuthStateChanged((user) => {
      this.currentUser = user;      
    });
  }

  async signup({ email, password }): Promise<any> {
    const credential = await this.afAuth.createUserWithEmailAndPassword(
      email,
      password
    );
 
    const uid = credential.user.uid;
 
    return this.afs.doc(
      `users/${uid}`
    ).set({
      uid,
      email: credential.user.email,
    })
  }
 
  signIn({ email, password }) {
    this.elEmail = email;
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }
 
  signOut(): Promise<void> {
    return this.afAuth.signOut();
  }


  //parte 2
  addChatMessage(msg) {
    return this.afs.collection('messages').add({
      msg: msg,
      from: this.currentUser.uid,
      createdAt: new Date,
      email: this.elEmail
    });
  }
   
  enviarEmail(){
    return this.elEmail;
  }
  getChatMessages() {
    let users = [];
    return this.getUsers().pipe(
      switchMap(res => {
        users = res;
        return this.afs.collection('messages', ref => ref.orderBy('createdAt')).valueChanges({ idField: 'id' }) as Observable<Message[]>;
      }),
      map(messages => {
        // Get the real name for each user
        for (let m of messages) {          
          m.fromName = this.getUserForMsg(m.from, users);
          m.myMsg = this.currentUser.uid === m.from;
        }        
        return messages
      })
    )
  }
   
  private getUsers() {
    return this.afs.collection('users').valueChanges({ idField: 'uid' }) as Observable<User[]>;
  }
   
  private getUserForMsg(msgFromId, users: User[]): string {  
    let email = '';  
    for (let usr of users) {
      if (usr.uid == msgFromId) {
        console.log(usr.email);
        email= usr.email;
        return usr.email;
      }
    }
    return msgFromId;
  }
}
