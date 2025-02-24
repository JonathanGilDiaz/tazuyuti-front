import { CommonModule, CurrencyPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DataTableDirective, DataTablesModule } from "angular-datatables";
import { ADTSettings } from 'angular-datatables/src/models/settings';
import { Subject } from 'rxjs';
import { DataTableParams, TipoEvento } from '../interfaces/datatable';
import { ModalService } from '../../modal/services/modal.service';
import { DatatableService } from '../services/datatable.service';

@Component({
  selector: 'app-datatable',
  standalone: true,
  imports: [DataTablesModule,CommonModule],
  providers: [CurrencyPipe],
  templateUrl: './datatable.component.html',
  styleUrl: './datatable.component.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class DatatableComponent implements OnInit, AfterViewInit, OnDestroy {

  /**
   * Directiva de la tabla del datatable.
   */
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  /**
   * URL del api donde se obtendran los registros
   * @type {string}
   */
  @Input() url : string;
  /**
   * ID que se le asignara a la tabla.
   * @type {string}
   */
  @Input() idTable : string;
  /**
   * Columnas de las tablas.
   * @type {any[]}
   */
  @Input() columnas: any[] = [];
  /**
   * Interface mas abstracta con los parametros a enviar a la petición.
   * @type {DataTableParams}
   */
  @Input() dataTablesParams: DataTableParams;
  /**
   * Lista de nombre de botones a mostrar en la tabla.
   * @type {string[]}
   */
  @Input() mostrarBotones : string[] = [];
  /**
   * Lista de nombres de botones de deshabilitar.
   * @type {string[]}
   */
  @Input() deshabilitarBotones:string[] = [];
  /**
   * Variable para actualizar de nuevo la tabla.
   * @type {EventEmitter<void>}
   */
  @Input() actualizarTabla: EventEmitter<void> = new EventEmitter<void>();
  /**
   * EventEmiter que regresa el tipo de evento y sus datos.
   * @type {EventEmitter<TipoEvento>}
   */
  @Output() eventoTipo : EventEmitter<TipoEvento> = new EventEmitter<TipoEvento>;
  /**
   * EventEmiter que regresa el tipo de evento y sus datos.
   * @type {EventEmitter<TipoEvento>}
   */
  @Output() eventoDataTablesParams : EventEmitter<DataTableParams> = new EventEmitter<DataTableParams>;
  /**
   * configuración de la tabla.
   * @type {ADTSettings}
   */
  dtOptions: ADTSettings = {};
  /**
   * Disparador para restablecer la tabla.
   * @type {Subject<any>}
   */
  dtTrigger: Subject<any> = new Subject<any>();

  /**
   * Arreglo donde se asignara el lenguaje para cada variable del datatable.
   * @type {Array}
   */
  lenguaje = {
    search: "Buscar:",
    lengthMenu: "Mostrar _MENU_ entradas",
    info: "Mostrar _START_ a _END_ de _TOTAL_ entradas",
    infoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
    infoFiltered: "(filtrado de un total de _MAX_ registros)",
    zeroRecords : "No se encontraron registros",
    paginate: {
      first: "Primero",
      last: "Ultimo",
      next: "Siguiente",
      previous: "Anterior"
    }	
  }

  constructor(
    private datatableService : DatatableService,
    private modalService: ModalService,
    public pipeCurrencyInstance: CurrencyPipe
  ) { }

  ngOnInit(): void {
    this.actualizarTabla.subscribe(() =>{
      this.actualizarDatosTabla();
    });
    if(!this.dataTablesParams) this.dataTablesParams = {};
    this.obtenerRegistros();
  }

  ngAfterViewInit(): void {
    const tableElement = document.getElementById(this.idTable);
    tableElement.style.width = '100%';

    setTimeout(() => {
      this.dtTrigger?.next(this.dtOptions);
      this.dtElement.dtInstance.then(dtInstance => {
        
        dtInstance.columns().every(function () {
          const that = this;
          $('input', this.footer()).on('keyup change', function () {
            if (that.search() !== this['value']) {
              that
                .search(this['value'])
                
                .draw();
            }
          });
        });
      });
    }, 200);
    
  }

  /**
   * Ingresa los datos al datatable obtenidos de la respuesta del api.
   */
  private obtenerRegistros(): void{
    setTimeout(() => {
      this.dtOptions = {
        language : this.lenguaje,
        serverSide : true,
        paging:true,
        searching : false,
        search : true,
        processing : true,
        //searchCols :true,
        responsive : true,
        ajax:(dataTablesParameters: any, callback) => {
          const columnSearches = dataTablesParameters.columns.map((col: any) => col.search.value || '');
          let order=dataTablesParameters.order[0];
          let colum =order.column;
          this.dataTablesParams.page = Math.floor(dataTablesParameters.start / dataTablesParameters.length) + 1;
          this.dataTablesParams.size = dataTablesParameters.length;
          this.dataTablesParams.search = dataTablesParameters.search.value;
          this.dataTablesParams.sort_field = dataTablesParameters.columns[colum].orderable ? dataTablesParameters.columns[colum]?.data.toString() : this.obtenerSiguienteNombreColumnaOrdenable(dataTablesParameters.columns);
          this.dataTablesParams.sort_direction = order.dir.toUpperCase();
          this.dataTablesParams.search_field="";
          this.eventoDataTablesParams.emit(this.dataTablesParams);
          this.datatableService.obtenerRegistros(this.url,this.dataTablesParams).subscribe({
            next : response =>{
              if(response.success){
                response.data.content = this.agregarNumeroConsecutivo(response.data.content,(dataTablesParameters.start+1));
                callback({
                  recordsTotal: response.data.content ? response.data.totalElements : 0,
                  recordsFiltered: response.data.content ? response.data.totalElements : 0,
                  data: response.data.content ? response.data.content : []
                });
              }else{
                if(!response.data.description?.includes("expirado")){
                  this.modalService.openAlertModal('error','Error', response.data.description + ': ' + response.data.detail).subscribe();
                }
                //this.modalService.openAlertModal('error','Error', response.data.description + ': ' + response.data.detail).subscribe();
              }
              
            },error : ()=> console.log("Ocurrió un error")
          });
        },
        columns : this.columnas.map(col => {
          if (col.ngTemplateRef) {
            col.ngTemplateRef.ref = this[col.data.toLowerCase()];
            col.ngTemplateRef.context = {
              captureEvents: this.onCaptureEvent.bind(this)
            };
          }
          if(col.ngPipeArgs){
            col.ngPipeInstance = this.pipeCurrencyInstance
          }
          return col;
        }),
        drawCallback: () => {
          this.registerClickHandlers();
        },
        
      };
    });
  }

  /**
   * Metodo para emitir el evento lanzando.
   * @param event Tipo evento donde se guarda el tipo y los datos del evento.
   */
  onCaptureEvent(event: TipoEvento) {
    this.eventoTipo.emit(event);
  }

  /**
   * Actualiza los datos de la tabla.
   */
  private actualizarDatosTabla(): void {
    if(this.dtElement){
      this.dtElement.dtInstance.then((dtInstance: any) => {
        dtInstance.ajax.reload();
      });
    }
  }
/**
 * Metodo para obtener el nombre de la columna
 * de la primer coincidencia con ordebale = true.
 * @param columns Lista de columnas de la tabla.
 * @returns Nombre de la primer columna con estado true en ordenable.
 */
  obtenerSiguienteNombreColumnaOrdenable(columns : any[]): string{
    return columns.find(column => column.orderable == true).data;
  }

  /**
   * Agrega un numero consecutivo a cada objeto de la lista.
   * @param array Lista de objetos.
   * @param startIndex Index donde comenzará el número consecutivo.
   * @returns {any[]}
   */
  agregarNumeroConsecutivo(array : any[], startIndex): any[]{
    return array.map((data, index) =>{
      return {
        ...data,
        numeroConsecutivo : startIndex + index
      }
    });
  }

  private registerClickHandlers() {
    // Usa Angular para manejar los eventos de clic en los botones generados
    const table = this.dtElement.dtInstance;
    table.then((dtInstance: any) => {
      dtInstance.on('click', 'button[data-action]', (event: any) => {
        const button = event.target.closest('button');
        const action = button.getAttribute('data-action');
        const index = button.getAttribute('data-index');
        this.handleActionClick(action, index,dtInstance);
      });
    });
  }

  private handleActionClick(action: string, index: number, dtInstance: any) {
    const rowData = dtInstance.row(index).data();

    this.eventoTipo.emit({
      cmd: action,
      data: rowData,
    });
  }

  ngOnDestroy(): void{
    this.dtTrigger?.unsubscribe();
    this.eventoTipo?.unsubscribe();
  }
}


