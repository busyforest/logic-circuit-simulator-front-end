import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CircuitEditorComponent} from './circuit-editor/circuit-editor.component';
import {UserCenterComponent} from './user-center/user-center.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'editor', component: CircuitEditorComponent },
  { path: 'user_center', component:UserCenterComponent },
];
