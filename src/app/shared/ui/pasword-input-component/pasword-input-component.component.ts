import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, forwardRef, inject, Input, input, OnChanges, Output, output, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';
import { faEyeSlash, faEye, faCheck, faTimes} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'input-password',
  standalone: true,
  imports: [CommonModule, FormsModule, DividerModule,PasswordModule,ReactiveFormsModule,FontAwesomeModule],
  templateUrl: './pasword-input-component.component.html',
  styleUrl: './pasword-input-component.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PaswordInputComponent),
      multi: true
    }
  ]
})
export class PaswordInputComponent implements ControlValueAccessor, OnChanges{

  @Output() inputContrasenia: EventEmitter<string> = new EventEmitter<string>();
  @Input() placeholder='';
  @Input() ocultarCriterios:boolean=false;
  @Input() campoValido:boolean=false;
  @Input() maxlength:number;
  @Input() minlength:number;
  @Input() autocomplete:string;
  @Input() valor:string;
  @Input() disabled:boolean =false;
  faEyeSlash = faEyeSlash;
  faEye = faEye;
  faCheck= faCheck;
  faTimes = faTimes;
  // Definir un array de criterios
  criterios = [
    { mensaje: 'La contraseña debe incluir al menos una letra minúscula.', evaluacion: () => this.evaluarMinuscula() },
    { mensaje: 'La contraseña debe incluir al menos una letra mayúscula.', evaluacion: () => this.evaluarMayuscula() },
    { mensaje: 'La contraseña debe incluir al menos un número.', evaluacion: () => this.evaluarNumero() },
    { mensaje: 'La contraseña debe incluir al menos un carácter especial.', evaluacion: () => this.evaluarCaracterEspecial() },
    { mensaje: 'La contraseña debe tener una longitud de al menos 8 caracteres.', evaluacion: () => this.evaluarLongitud() }
  ];  

  banderaMostrarContrasenia: boolean = false;
  _value:string="";
  tieneMinuscula:boolean=false;
  tieneMayuscula:boolean=false;
  tieneNumero:boolean=false;
  tieneCaracterEspecial:boolean=false;
  tieneLongitudSuficiente:boolean=false;

  constructor(private elementRef: ElementRef) {
    
  }
  ngOnChanges(changes: SimpleChanges): void {
    let change = changes['valor'];
    if (change && change.currentValue !== undefined) {
      if (change.currentValue === '') {
        this._value="";
      }
    }
  }

  emitirTexto() {
    if(this.evaluarMinuscula() && this.evaluarMayuscula &&
      this.evaluarNumero() && this.evaluarCaracterEspecial() &&
      this.evaluarLongitud()){
        this.inputContrasenia.emit(this._value);
    }else{
      this.inputContrasenia.emit("");
    }
  }

  evaluarMinuscula(): boolean {
    return /[a-z]/.test(this._value);
  }

  evaluarMayuscula(): boolean {
    return /[A-Z]/.test(this._value);
  }

  evaluarNumero(): boolean {
    return /\d/.test(this._value);
  }

  evaluarCaracterEspecial(): boolean {
    return /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(this._value);
  }

  evaluarLongitud(): boolean {
    return this._value?.length > 7;
  }

  focusInput() {
    const inputElement = this.elementRef.nativeElement.querySelector('input');
    if (inputElement) {
      inputElement.focus();
    }
  }

  get value(): string {
    return this._value;
  }

  set value(value: string) {   
      this._value = value;
      this.propagateChange(this._value);

    
  }

  writeValue(value: string) {
    if (value !== undefined) {
      this.value = value;
    }
  }

  propagateChange = (_: any) => { };
  propagateTouched = (_: any) => { };

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn) {
    this.propagateTouched = fn;
  }

  touched($event) {
    this.propagateTouched($event);
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}