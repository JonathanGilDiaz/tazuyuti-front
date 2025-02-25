import { Routes } from '@angular/router';
import { LogInComponent } from './features/log-in/log-in.component';
import { SignUpComponent } from './features/sign-up/sign-up.component';

export default [
  {
    path: 'login',
    component: LogInComponent,
  },
  {
    path: 'signup',
    component: SignUpComponent
  }
] as Routes;
