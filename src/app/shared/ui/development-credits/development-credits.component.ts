import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-development-credits',
    standalone: true,
    imports: [],
    templateUrl: './development-credits.component.html',
    styleUrl: './development-credits.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevelopmentCreditsComponent {
  logoTecnologias = 'assets/template/images/TECNOLOGIAS.png';
}
