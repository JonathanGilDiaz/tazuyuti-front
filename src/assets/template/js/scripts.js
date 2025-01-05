 //select

$(document).ready(function () {
    $( '.form-select' ).select2( {
    theme: "bootstrap-5",
    containerCssClass: "select2--small",
    dropdownCssClass: "select2--small",
});
});

$(function(){
    $('#datepicker').datepicker();   
  });

//check
  
$(document).ready(function(){
    $('input').iCheck({
      checkboxClass: 'icheckbox_square',
      radioClass: 'iradio_square',
      increaseArea: '20%' // optional
    });
});

//DataTables
$(document).ready(function() {		
  $('table.display').DataTable(          
      { 
          "language": {
          "sSearch": "Buscar:",
          "sLengthMenu": "Mostrar _MENU_ entradas",
          "sInfo": "Mostrar _START_ a _END_ de _TOTAL_ entradas",
          "paginate": {
              "first": "Primero",
              "last": "Ultimo",
              "next": "Siguiente",
              "previous": "Anterior"
              }	
          }
      }		
  );

  $('.dataTables_filter input').addClass('form-control table-input');
  
} );

$('table.display').DataTable( {
responsive: true
} )

