/**
 * Componente formulario que contiene la carcaza principal,que consta
 * de ubicarse en la parte izquierda y los botones centrados.
 */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import {  ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'dinamic-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './dinamic-form.component.html',
  styleUrl: './dinamic-form.component.css'
})
export class DinamicFormComponent {

  @Input() buttonText: { cancel: string, submit: string, return: string } = { cancel: 'Cancelar', submit: 'Guardar', return: 'Regresar' }; // Textos de los botones
  @Input() buttonShow: { cancel: boolean, submit: boolean, return: boolean } = { cancel: true, submit: true, return: false };
  @Input() buttonIcons: { cancel: string, submit: string, return: string } = { cancel: 'pi pi-times', submit: 'pi pi-check', return: 'pi pi-arrow-left' }; // Iconos de los botones
  @Input() formData: any;  // Para pasar los datos iniciales del formulario si es necesario
  @Output() formCancelled = new EventEmitter<void>();  // Emitir cuando se cancela el formulario
  @Output() formSubmitted = new EventEmitter<void>();   // Emitir cuando se envía el formulario
  @Input() nombreFormulario : string ='';

  ngOnInit() {

  }

  onCancel() {
    this.formCancelled.emit();
  }

  onSubmit() {
    this.formSubmitted.emit();
  }
}
