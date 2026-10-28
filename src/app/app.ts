import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Shell } from '@layout/shell/shell';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Shell],
  templateUrl: './app.html',
})
export class App {}
