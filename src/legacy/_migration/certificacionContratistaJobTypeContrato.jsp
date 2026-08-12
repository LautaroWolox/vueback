<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>

<html>
<head>
<title>Field Manager</title>

<link rel="shortcut icon" type="image/png" href="resources/images/FM_logo.png">
<link rel="stylesheet" type="text/css" media="screen" href="resources/js/jquery-ui-1.12.1/jquery-ui.css" />
<link rel="stylesheet" type="text/css" media="screen" href="resources/js/jqgrid/css/ui.jqgrid-bootstrap.css" />
<link rel="stylesheet" href="<c:url value='webjars/bootstrap/3.3.7-1/css/bootstrap.min.css'/>" />
<link rel="stylesheet" href="<c:url value="/resources/css/tpstyle.css" />" />
<link rel="stylesheet" href="<c:url value="/resources/css/general.css" />" />
<link rel="stylesheet" href="<c:url value="/resources/css/certificacion-contratistas.css" />" />
<link rel="stylesheet" href="<c:url value="/resources/css/easy-autocomplete.css" />" />

<script type="text/javascript" src="resources/js/jqgrid/js/jquery-1.11.0.min.js"></script>
<script type="text/javascript" src="resources/js/jquery-ui-1.12.1/jquery-ui.min.js"></script>
<script type="text/javascript" src="resources/js/jqgrid/js/i18n/grid.locale-es.js"></script>
<!-- <script type="text/javascript" src="resources/js/jqgrid/js/jquery.jqGrid.min.js"></script> -->
<script src="resources/js/jqgrid/src/jquery.jqGrid.js" type="text/javascript"></script>
<script type="text/javascript" src="resources/js/jqgrid/jszip.min.js"></script>
<script type="text/javascript" src="resources/js/format/jquery.format.js"></script>
<script type="text/javascript" src="resources/js/jquery.easy-autocomplete.js"></script>
<script type="text/javascript" src="<c:url value='webjars/bootstrap/3.3.7-1/js/bootstrap.min.js'/>"></script>
<script type="text/javascript" src="<c:url value='/resources/js/jquery-ui-timepicker-addon.js'/>"></script>

<script type="text/javascript" src="<c:url value='/resources/js/general.js'/>"></script>
<script>var generalPagerOptions =<c:out value="${generalPagerOptions}"/>;</script>

<script type="text/javascript" src="<c:url value='/resources/js/certificacion-contratista/certificacion-contratista-jobtype-contrato.js'/>"></script>

</head>
<body>
	

	<div class="container-fluid">
		<div class="panel-group" id="accordion2">
			<div class="panel panel-default">
				<div class="panel-heading">
					<h4 class="panel-title">
						<a data-toggle="collapse" href="#collapseFilters">Filtros de B&uacute;squeda</a>
					</h4>
				</div>
				<div id="collapseFilters" class="panel-collapse collapse in">
					<div class="panel-body">
						<div class="form-group text-center">
							<button id='btnBuscar' type="button" class="btn btn-primary">BUSCAR</button>
<!-- 							<button id='btnLimpiar' type="button" class="btn btn-default">LIMPIAR</button> -->
						</div>
						
					</div>
				</div>
			</div>
			<div class="panel panel-default">
				<div class="panel-heading">
					<h4 class="panel-title">
						<a data-toggle="collapse" href="#collapseGrid">RELACIONES JOBTYPE-CONTRATO</a>
					</h4>
				</div>
				<div id="collapseGrid" class="panel-collapse collapse in">
					<div class="panel-body">
						<div class='col-md-12 grid-container'>
							<table id="Grid"></table>
							<div id="Pager"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>


	<!-- Modal alta rel jobtype-contrato -->
	<div class="modal fade bs-example-modal-lg" id="altaRelJobTypeContrato" tabindex="-1" role="dialog"
		 aria-labelledby="myModalLabel">
		<div class="modal-dialog modal-lg" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
					<h4 class="modal-title" id="myModalLabel">Alta Jobtype - Contrato
						<p class="nro-ot-title"></p>
					</h4>
				</div>
				<div class="modal-body">

					<div class='row' style="min-height: 75px; display: flex; align-items: flex-start;">
						<div class='col-md-2'>
							<label>Pais</label>
							<select class="form-control" id='pais'>
								<option value=""></option>
							</select>
						</div>
						<div class='col-md-4'>
							<label>Jobtype</label>
							<input readonly id='jobtypeRel' type='text' class='form-control'/>
						</div>
						<div class='col-md-4'>
							<label>Contrato</label>
							<input readonly id='contratoRel' type='text' class='form-control'/>
						</div>
							<div class='col-md-2' style="align-self: center">
								<button id='agregarRel' type="button" class="btn btn-primary">AGREGAR</button>
							</div>
					</div>

					<div class='row'>
						<div class='col-md-12'>
							<div class='col-md-12 grid-container rel-grid-cont'>
								<table id="altaRelJobContrato"></table>
								<div id="altaRelJobContratoPager"></div>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button id="nuevaRelJobtypeContrato" type="button" class="btn btn-primary">RELACIONAR</button>
				</div>
			</div>
		</div>
	</div>
	<!-- 		.					 -->
	<!-- Modal no se encontraron resultados-->
	<div id="myModalNoResul" class="modal">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal">
						<span aria-hidden="true">x</span><span class="sr-only">Close</span>
					</button>
					<h4 class="modal-title">Alerta</h4>
				</div>
				<div class="modal-body">
					<p>No se encontraron resultados</p>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-lg btn-default" data-dismiss="modal">Cerrar</button>
				</div>
			</div>
		</div>
	</div>
	<!-- 		.					 -->

	<!-- Mensaje de seleccion-->
	<div id="msgSeleccion" class="modal">
		<div class="modal-dialog modal-sm">
			<div class="modal-content">
				<div class="modal-header msgSeleccionHeader">
					<button type="button" class="close" data-dismiss="modal">
						<span aria-hidden="true">x</span><span class="sr-only">Close</span>
					</button>
					<h4 class="modal-title">Aviso</h4>
				</div>
				<div class="modal-body">
					<div class='row'>
						<div class='col-md-6'>Seleccione una fila</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<!-- 		.					 -->

	<!-- Error fallo de conexión -->
	<div id="errorConexion" class="modal">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal">
						<span aria-hidden="true">x</span><span class="sr-only">Cerrar</span>
					</button>
					<h4 class="modal-title">Alerta</h4>
				</div>
				<div class="modal-body">
					<p>Error de conexión. Contacte al administrador</p>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-lg btn-default" data-dismiss="modal">Cerrar</button>
				</div>
			</div>
		</div>
	</div>
	<!-- 	 -->
	
	<!-- Modal respuesta de error-->
	<div id="alertErrorMensaje" class="modal">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal">
						<span aria-hidden="true">x</span><span class="sr-only">Close</span>
					</button>
					<h4 class="modal-title">Alerta</h4>
				</div>
				<div class="modal-body">
					<p></p>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-lg btn-default" data-dismiss="modal">Cerrar</button>
				</div>
			</div>
		</div>
	</div>
	<!-- 		.					 -->

	<div id="modificarJobType" class="modal">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal">
						<span aria-hidden="true">x</span><span class="sr-only">Cerrar</span>
					</button>
					<h4 class="modal-title" id="nuevaAltaH">Edición Jobtype-Contrato</h4>
				</div>
				<div class="modal-body">
					<div class='row'>
						<div class='col-md-6'>
							<div class="form-group">
								<label class="control-label">JobType</label>
								<input class="form-control modificacion disabled" id="JobTypeModificacion" type="text" style="width:200px;"></input>
							</div>
						</div>
						<div class='col-md-3'>
						</div>
						<div class='col-md-6'>
							<div class="form-group">
								<label class="control-label">Contrato</label>
								<input class="form-control modificacion disabled" id="ContratoModificacion" type="text" style="width:200px;"></input>
							</div>
						</div>
						<div class='col-md-6'>
							<input class="form-control modificacion disabled" id="JobTypeModificacionId" type="hidden"></input>
						</div>
						<div class='col-md-6'>
							<div class="form-group">
								<input class="form-control modificacion" id="ContratoModificacionUpdate" type="text" style="width:200px;"></input>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-primary" id="actualizar">Actualizar</button>
				</div>
			</div>
		</div>
	</div>
	


	<jsp:include page="alertModal.jsp"></jsp:include>
	<jsp:include page="alertConfirmar.jsp"></jsp:include>
	<jsp:include page="alertConfirmarCancelar.jsp"></jsp:include>

	<!-- 	Spinner -->
	<div id='panel-loader' class='loader default'>
		<span class='loader-icon tpicon tpicon-loader'></span>
	</div>




</body>
</html>