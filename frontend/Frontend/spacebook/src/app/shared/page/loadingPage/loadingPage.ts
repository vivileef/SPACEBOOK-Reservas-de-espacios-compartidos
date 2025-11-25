import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-loading-page',
  imports: [RouterLink],
  templateUrl: './loadingPage.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingPage { }
