import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CircuitEditorComponent} from './circuit-editor/circuit-editor.component';
import {UserCenterComponent} from './user-center/user-center.component';
import {UserRegisterComponent} from './user-register/user-register.component';
import {AuthGuard} from '../auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'editor', component: CircuitEditorComponent, canActivate:[AuthGuard] },
  { path: 'editor/:id', component: CircuitEditorComponent, canActivate:[AuthGuard]},
  { path: 'user_center', component: UserCenterComponent, canActivate:[AuthGuard] },
  { path: 'user_register', component: UserRegisterComponent }
];
