import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CircuitEditorComponent} from './circuit-editor/circuit-editor.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'editor', component: CircuitEditorComponent },
];
