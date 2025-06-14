import { Component } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {SharedService} from '../../shared.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-ai-chat-box',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './ai-chat-box.component.html',
  styleUrl: './ai-chat-box.component.css'
})
export class AiChatBoxComponent {
  isLoading: boolean = false;

  closeSidebar() {
    this.sharedService.isBarOpen = false;
  }

  userInput: string = '';
  chatMessages: { sender: 'user' | 'bot'; text: string }[] = [];

  sendMessage() {
    const input = this.userInput.trim();
    if (!input) return;

    // 用户消息
    this.chatMessages.push({ sender: 'user', text: input });
    // 清空输入框
    this.userInput = '';
    let botReply = "";
    this.isLoading = true;  // 开始加载
    this.http.post(`http://${this.sharedService.serverAddress}:8080/webpj/ai/query`, input).subscribe((response:any)=>{
      this.isLoading = false;
      if(response.code != 200){
        alert("发生错误：" + response.message);
      }else{
        botReply = response.data;
        this.chatMessages.push({ sender: 'bot', text: botReply });
      }
    });
  }

  constructor(protected sharedService:SharedService, private http:HttpClient) {
  }

}
