import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './Login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login { }
