import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[onlyText]',
  standalone: true
})
export class OnlyTextDirective {

  constructor(
    private el : ElementRef,
    private renderer : Renderer2) { }

    @HostListener('input',['$event'])
    onInputChange(event : Event){
      if(this.el.nativeElement instanceof HTMLInputElement){
        this.el.nativeElement as HTMLInputElement;
        let value = this.el.nativeElement.value;
        // Reemplazar todo lo que no sea letras, espacios y ciertos caracteres opcionales
        value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''); 
        if(value){
          this.renderer.setProperty(this.el.nativeElement, 'value', value);
        }else {
          this.renderer.setProperty(this.el.nativeElement, 'value', '');
        }
    
      }
    }

}
