import { Injectable } from '@angular/core';
import { IMessageOfTheDay } from '../../lib/interfaces/motd/IMessageOfTheDay'

@Injectable({
  providedIn: 'root'
})
export class MessageOfTheDayService {

  constructor() { }

  private messageOfTheDay: IMessageOfTheDay;

  public setMessageOfTheDay(header: String, content: String) {
    this.messageOfTheDay = {
      header: header, 
      content: content, 
      expiryDate: new Date()
    }
  }

  public getMessageOfTheDay() {
    console.log(this.messageOfTheDay.expiryDate)
    return this.messageOfTheDay; 
  }
}
