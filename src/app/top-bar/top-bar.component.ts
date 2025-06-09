import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AiChatBoxComponent} from '../ai-chat-box/ai-chat-box.component';
import {SharedService} from '../../shared.service';

@Component({
  selector: 'app-top-bar',
  imports: [
    RouterLink,
    FormsModule,
    AiChatBoxComponent,
    AiChatBoxComponent
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent {

  openSidebar() {
    this.sharedService.isBarOpen = true;
  }
  constructor(protected sharedService:SharedService) {
  }
}
