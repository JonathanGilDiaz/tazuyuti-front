import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appOnlyNumber]',
  standalone: true
})
export class OnlyNumberDirective {

  constructor(
    private el : ElementRef,
    private renderer : Renderer2) { }

    @HostListener('input',['$event'])
    onInputChange(event : Event){
      if(this.el.nativeElement instanceof HTMLInputElement){
        this.el.nativeElement as HTMLInputElement;
        let value = this.el.nativeElement.value.replace(/[^0-9]/g, '');
        if(value){
          this.renderer.setProperty(this.el.nativeElement, 'value', value);
        }else {
          this.renderer.setProperty(this.el.nativeElement, 'value', '');
        }
    
      }
    }

}
