
var pagerDefaultOptions = generalPagerOptions.defaultPagerOpts;
var selectedRowData; //Row seleccionada de la grilla principal

const _GRID = "#Grid";
const _GRID_PAGER = "#Pager";

const ALTA_REL_GRID = "#altaRelJobContrato";
const ALTA_REL_GRID_PAGER = "#altaRelJobContratoPager";

let paisSelected = 0;
let jobtypeAutocompSelected = {};
let contratoAutocompSelected = {};

	$(document).ready(function() {
		console.log("certificacion contratista");

		$('#myTabs a').click(function (e) {
		  e.preventDefault()
		  $(this).tab('show')
		});




		// $("#jobtypeRel").easyAutocomplete(getAutocompleteOpts("jobtypeContrato/getJobTypeTarea/", function(scope) {
		// 	jobtypeAutocompSelected = $("#jobtypeRel").getSelectedItemData();
		// }));
		//
		// $("#contratoRel").easyAutocomplete(getAutocompleteOpts("jobtypeContrato/getContrato/", function(scope) {
		// 	contratoAutocompSelected = $("#contratoRel").getSelectedItemData();
		// }));

		$("#ContratoModificacionUpdate").easyAutocomplete(getAutocompleteOpts("jobtypeContrato/getContrato/", function(scope) {
			contratoAutocompSelected = $("#ContratoModificacionUpdate").getSelectedItemData();
		}));

		$("#fechaDesde").datetimepicker({
			dateFormat: 'dd/mm/yy',
			maxDate : new Date(),
			changeYear: true,
			onClose: function(dateText, inst) {
				if ($("#fechaHasta").val().length > 0 && dateText.length > 0) {
					$("#fechaHasta").datetimepicker("setDate", null );
				}
			}
		});

		$("#fechaHasta").prop("disabled", true);
		$("#fechaDesde").on('change', function () {
			if($("#fechaDesde").val()) {
				var minDate = new Date($("#fechaDesde").datetimepicker('getDate'));
				var maxDate = new Date();
				$("#fechaHasta").removeProp("disabled");
				$("#fechaHasta").datetimepicker('destroy');
				$("#fechaHasta").datetimepicker({
					dateFormat: 'dd/mm/yy',
					minDate : minDate,
					maxDate : maxDate
				});
			} else {
				$("#fechaHasta").datetimepicker('destroy');
				$("#fechaHasta").val("");
				$("#fechaHasta").prop("disabled", true);

				$("#fechaHasta").parent().find(".error-msg").remove();
			}
		});

		$("#fechaHasta").on('change', function(e) {
			if(e.target.value !== "") {
	//			$(this).parent().find(".error-msg").remove();
			} else {
				$(this).prop("disabled", true);
			}
		});

		$("#actualizar").on('click', function(e) {

			let contratoModificacionUpdate = $("#ContratoModificacionUpdate").val();
			if (!contratoModificacionUpdate) {
				// mostrar aviso de vacio
				return;
			}

			toggleLoader();

			let jobType = {
					tareaContratoId	: $("#JobTypeModificacionId").val(),
					tipoContratoId  : contratoAutocompSelected.contratoId,
				};

			$.get("jobtypeContrato/actualizarJobtype.html", jobType, function(data) {

				$('#ContratoModificacionUpdate').val('');
				$('#modificarJobType').modal("hide");
				$('#btnBuscar').trigger('click');

			}).fail(function(a,b, e) {
				$("#errorConexion").modal("show");
			}).always(function() {
				  toggleLoader();
			});
		});

		var gridModels = getGridModels();
		createCustomGrid(gridModels, _GRID, _GRID_PAGER);
		createGridPager(_GRID, _GRID_PAGER);

		$("#btnBuscar").click(function () {
			var filtrosBusqueda = $("#filtrosForm :input").serialize();
			initJobTypeGrid("jobtypeContrato/getJobTypes.html", filtrosBusqueda);
		});

		$("#altaRelJobTypeContrato").on('shown.bs.modal', function () {
			initRelJobtypeGrid();
		});

		$("#modificarJobType").on('hide.bs.modal', function(e, a) {
			let contratoModificacionUpdate = $("#ContratoModificacionUpdate").val();

			if (contratoModificacionUpdate.length != 0) {
			//mostrar modal de existen campos
			var alertConfirm = $("#alertConfirmar");
			alertConfirm.find('#messageModal').html("Hay datos ingresados, confirma que desea cancelar?");
			alertConfirm.modal("show");
			return false;
		}
		});

		$("#altaRelJobTypeContrato").on('hide.bs.modal', function(e, a) {
			//validar si existen campos cargados
			let allData = $(ALTA_REL_GRID).jqGrid('getGridParam', 'data');

			let currJobty = $("#jobtypeRel").val();
			let currContrato = $("#contratoRel").val();
			if (currJobty.length || currContrato.length || jobtypeAutocompSelected.codigo ||
			contratoAutocompSelected.codigo || (allData && allData.length)) {
				//mostrar modal de existen campos
				var alertConfirm = $("#alertConfirmar");
				alertConfirm.find('#messageModal').html("Hay datos ingresados, confirma que desea cancelar?");
				alertConfirm.modal("show");
				return false;
			}
			$("#altaRelJobTypeContrato").find(".error-msg").remove();
		});

		$("#agregarRel").click(function () {
			agregarNuevaRelacion(jobtypeAutocompSelected, contratoAutocompSelected);
		});

		$("#nuevaRelJobtypeContrato").click(() => {
			grabarNuevasRelaciones();
		});

		$("#pais").change(function (e) {
			$("#jobtypeRel").val("");
			$("#contratoRel").val("");

			if (e.target.value !== "") {
				paisSelected=e.target.value;

				$("#jobtypeRel").easyAutocomplete(getAutocompleteOpts2("jobtypeContrato/getJobTypeTarea/", function(scope) {
					jobtypeAutocompSelected = $("#jobtypeRel").getSelectedItemData();
				}));

				$("#contratoRel").easyAutocomplete(getAutocompleteOpts("jobtypeContrato/getContrato/", function(scope) {
					contratoAutocompSelected = $("#contratoRel").getSelectedItemData();
				}));

				$("#jobtypeRel").prop("readOnly", false);
				$("#contratoRel").prop("readOnly", false);
			} else {
				paisSelected=0;

				$("#jobtypeRel").prop("readOnly", true);
				$("#contratoRel").prop("readOnly", true);
			}
		});
	});

function createCustomGrid(colModels, grid, pager) {
	// Configuracion de la grilla
	$(grid).jqGrid({
		colModel : colModels,
		autoheight : true, 
		autowidth : true,
		rowNum : 100,
		rowList : [ 100, 250, 500 ],
		datatype : 'local',
		shrinkToFit : false,
		forceFit : true,
		viewrecords : false,
		gridview : true,
		grouping: true,
//		colMenu : true,	
		emptyrecords : "No hay resultados",
		loadonce : true,
		loadComplete : function() {
			var newWidth = $(grid).closest(".ui-jqgrid").parent().width();
			$(grid).jqGrid("setGridWidth", newWidth, true);
			var newHeght = window.innerHeight - 450;
			$(grid).jqGrid('setGridHeight', newHeght);
			$(grid).trigger("resize");
		},
		rowattr : function(rd) {
			if (rd.activo !== "S") {
				return {
					"class" : "disabled"
				};
			}
		},
		styleUI : 'Bootstrap',
		pager : pager,
		viewrecords: true
	});

	// Barra de filtros
	$(grid).jqGrid('filterToolbar', {
		stringResult : true,
		searchOnEnter : false,
		searchOperators : true,
	});

	// Evento de resize
	$(window).off("resize");
	$(window).on("resize", function() {
		var newWidth = $(grid).closest(".ui-jqgrid").parent().width();
		$(grid).jqGrid("setGridWidth", newWidth, true);
		var newHeght = window.innerHeight - 320;
		$(grid).jqGrid('setGridHeight', newHeght);
	});

	//Previene el autocompletado de chrome en los filtros de busqueda
	$(".ui-jqgrid").find(".ui-search-input input").attr("autocomplete", "none");
}

const grabarNuevasRelaciones = () => {
		var allData = $(ALTA_REL_GRID).jqGrid('getGridParam', 'data');
		if (allData.length) {
			let data = JSON.stringify(allData);
			$.post("jobtypeContrato/nuevaRelJobtypeContrato.html", {nuevasRelaciones: data}, function(data) {

				if (data.length == 0) {
					showAlert("Relaciones JobType Contrato creadas exitosamente.");
				} else if (data.length == 1) {
					showAlert(data[0].mensaje);
				} else if (data.length > 1) {
					
					var messageStr = "Ya existe una relación Jobtype-Contrato para los jobtypes: ";
					for (var i = 0; i < data.length; i++) {
						messageStr += data[i].tareaCodigo + "<br>";
					}					
					showAlert(messageStr);
				}
				
				jQuery(ALTA_REL_GRID).jqGrid("clearGridData");
				$("#jobtypeRel").val("");
				$("#contratoRel").val("");

				$("#altaRelJobTypeContrato").find(".error-msg").remove();
				
				$("#ContratoModificacionUpdate").val("");
				$("#altaRelJobTypeContrato").modal("hide");
				
				$('#btnBuscar').trigger('click');
			});
		} else {
			//mostrar mensaje
			$(".rel-grid-cont").parent().find(".error-msg").remove();
			$("#altaRelJobTypeContrato").find(".rel-grid-cont").after("<div class='error-msg text-center'>Debe existir al menos una relación</div>");
		}
}

const aceptarAlert = () => {
	//limpiar datos del modal de alta rel
	jobtypeAutocompSelected = {};
	contratoAutocompSelected = {};
	jQuery(ALTA_REL_GRID).jqGrid("clearGridData");
	$("#jobtypeRel").val("");
	$("#contratoRel").val("");

	$("#ContratoModificacionUpdate").val("");
	$("#modificarJobType").modal("hide");
	
	$("#altaRelJobTypeContrato").modal("hide");
	$("#alertConfirmar").modal("hide");
}

const agregarNuevaRelacion = (jobtypeSelected, contratoSelected) => {
	$("#altaRelJobTypeContrato").find(".error-msg").remove();

	let idJobtype = jobtypeSelected.id;
	let idContrato = contratoSelected.contratoId;
	let pais = paisSelected;

	if (!idJobtype) {
		//muestro mensaje de campo obligatorio
		$("#jobtypeRel").after("<div class='error-msg'>El campo es incorrecto o inexistente</div>");
		return;
	}
	if (!idContrato) {
		//muestro mensaje de campo obligatorio
		$("#contratoRel").after("<div class='error-msg'>El campo es incorrecto o inexistente</div>");
		return;
	}

	//Validar existencia
	var allData = $(ALTA_REL_GRID).jqGrid('getGridParam', 'data');
	for (var i = 0; i < allData.length; i++) {
		var currCod = allData[i].relCodigoTarea;
		if (jobtypeSelected.codigo.indexOf(currCod) != -1) {
			// El registro ya esta en la grilla
			$("#altaRelJobTypeContrato").find(".rel-grid-cont").after("<div class='error-msg text-center'>" +"Ya se descargó una relación para el Jobtype  " + jobtypeSelected.codigo + "</div>");
			return;
		}
	}

	//Nueva row en la grilla de materiales
	$(ALTA_REL_GRID).jqGrid('addRowData', 0, [ {
		relCodigoTarea: jobtypeSelected.codigo,
		relTarea: jobtypeSelected.nombre,
		relContratoId: contratoSelected.contratoId,
		relContrato: contratoSelected.nombre,
		paisId: paisSelected,
		pais: paisSelected==='1'?"ARG/UY":paisSelected==='2'?"PY":"?"
		} ]);
	
	$(ALTA_REL_GRID).trigger("reloadGrid");

	//limpiando los input de seleccion
	$("#altaRelJobTypeContrato").find(".error-msg").remove();
	$("#jobtypeRel").val("");
	$("#contratoRel").val("");
	jobtypeAutocompSelected = {};
	contratoAutocompSelected = {};
}

	const initRelJobtypeGrid = () => {

		updateSelect("pais", [{"textContent":'ARG/UY',"value":1},{"textContent":'PY',"value":2}]);

		$.jgrid.gridUnload(ALTA_REL_GRID);

		let gridModels = altaJobtypeContratoRelModels();
		createAltaRelGrid(gridModels, ALTA_REL_GRID, ALTA_REL_GRID_PAGER);
		createAltaRelPager(ALTA_REL_GRID, ALTA_REL_GRID_PAGER);

		$(ALTA_REL_GRID).jqGrid("clearGridData");
		$(ALTA_REL_GRID).trigger('reloadGrid');
	}

function initJobTypeGrid(url, filters) {
	var grid = "#Grid";
	var pager = "#Pager";
	initGrid(url, filters, grid, function(data) {
		var gridModels = getGridModels();
		createCustomGrid(gridModels, grid, pager);
		createGridPager(grid, pager);
		$(grid).jqGrid('setGridParam', {sortname: 'codigoTarea', sortorder: 'desc'}).trigger('reloadGrid', [{page: 1}]);
		//$(_GRID).sortGrid('codigoTarea', false, 'desc');
		$("#busquedaSinFiltros").modal("hide");
		if (!data.length) {
			$("#myModalNoResul").modal("show");
		}
	}, function() {
		$("#errorConexion").modal("show");
	});
}

const aceptarAlertOkCancel = () => {
	toggleLoader();
	let selectedRow = $(_GRID).jqGrid("getGridParam", 'selrow');
	let dataSelected = $(_GRID).jqGrid ('getRowData', selectedRow);

	$.post("jobtypeContrato/desactivarRelJobContrato.html", {idRelacion: dataSelected.tareaContratoId} ,function(data) {
		if (data.status) {
			
			
		}
		$('#btnBuscar').trigger('click');
	}).fail(function(error) {
	}).always(function() {
		toggleLoader();
	});
	
}

function getGridModels() {
	return gridModel = [ {
		name : 'tareaContratoId',
		index : 'tareaContratoId',
		hidden: true
	},
	{
		label : 'CODIGO_TAREA',
		name : 'tareaCodigo',
		index : 'tareaCodigo',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 25
		},
		searchoptions : soptText
	},	
	{
		label : 'TAREA',
		name : 'tareaNombre',
		index : 'tareaNombre',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 25
		},
		searchoptions : soptText
	},
	{
		label : 'NOMBRE_CONTRATO',
		name : 'contratoNombre',
		index : 'contratoNombre',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 25
		},
		searchoptions : soptText
	},
	{
		label : 'USUARIO_MODIFICACION',
		name : 'legajoModificacion',
		index : 'legajoModificacion',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 25
		},
		searchoptions : soptText
	},
	{
		label : 'FECHA_MODIFICACION',
		name : 'fechaModificacion',
		index : 'fechaModificacion',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 25
		},
		sorttype : 'date',
		formatter : 'date',
		formatoptions : {
			srcformat : 'd/m/Y H:i',
			newformat : 'd/m/Y H:i'
		},
		searchoptions : soptText
	},
	{
		label : 'ACTIVO',
		name : 'activo',
		index : 'activo',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 25
		},
		searchoptions : soptText
	},
	{
		label : 'PAIS',
		name : 'pais',
		index : 'pais',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 5
		},
		searchoptions : soptText
	},
	{
		name : 'tareaId',
		index : 'tareaId',
		hidden: true
	},
	{
		name : 'contratoTipoId',
		index : 'contratoTipoId',
		hidden: true
	}
	];
}

const altaJobtypeContratoRelModels = () => {
	return gridModel = [ {
		label : 'ID',
		name : 'id',
		index : 'id',
		hidden: true
	},
	{
		label : 'CODIGO_TAREA',
		name : 'relCodigoTarea',
		index : 'tareaCodigo',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 25
		},
		searchoptions : soptText
	},
	{
		label : 'TAREA',
		name : 'relTarea',
		index : 'tareaNombre',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 25
		},
		searchoptions : soptText
	},
	{
		label : 'NOMBRE_CONTRATO',
		name : 'relContrato',
		index : 'contratoNombre',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 25
		},
		searchoptions : soptText
	},
		{
			label : 'PAIS',
			name : 'pais',
			index : 'pais',
			coloptions : generalColoptions,
			editable : true,
			editoptions : {
				maxlength : 5
			},
			searchoptions : soptText
		},
	{
		name : 'relContratoId',
		index : 'contratoTipoId',
		hidden: true
	}
	];
}
function createGridPager(grid, pager) {
	$(grid).navGrid(pager, pagerDefaultOptions,
			// Edit Dialog
			null,

			// Add Dialog
			null,

			// Delete Dialog
			null
			);

			$(grid).navButtonAdd(pager, {
				buttonicon : "glyphicon glyphicon-plus",
				title : "Nueva relación",
				caption : "",
				position : "first",
				onClickButton : function() {
					$("#altaRelJobTypeContrato").modal("show");
				}
			});


			$(grid).navButtonAdd(pager, {
				buttonicon : "glyphicon glyphicon-edit",
				title : "Modificar",
				caption : "",
				position : "first",
				onClickButton : function() {
					var selectedRow = $(grid).jqGrid("getGridParam", 'selrow');
					if (selectedRow) {
						selectedRowData = jQuery(_GRID).getRowData(selectedRow);
						
						$('input.modificacion').val('');
						
						$('#JobTypeModificacion').val(selectedRowData.tareaNombre);
						$('#ContratoModificacion').val(selectedRowData.contratoNombre);
						$('#JobTypeModificacionId').val(selectedRowData.tareaContratoId);
						
						$('#modificarJobType').modal("show");
						

					} else {
						$("#msgSeleccion").modal("show");
					}
				}
			});
			$(grid).navButtonAdd(pager, {
				buttonicon : "glyphicon glyphicon-trash",
				title : "Desactivar",
				caption : "",
				position : "first",
				onClickButton : function() {
					//Eliminar registro
					var selectedRow = $(grid).jqGrid("getGridParam", 'selrow');
					if (selectedRow) {
						selectedRowData = jQuery(_GRID).getRowData(selectedRow);
						let alertConfirm = $("#alertConfirmarCancelar");
						alertConfirm.find('.messageModal').html('Confirma que desea desactivar la relación seleccionada?');
						alertConfirm.modal("show");
						
						
					} else {
						$("#msgSeleccion").modal("show");
					}
				}
			});

			initExport(grid, pager, 'Jobtype_Contrato.xlsx');
}


const createAltaRelGrid = (colModels, grid, pager) => {
	// Configuracion de la grilla
	$(grid).jqGrid({
		colModel : colModels,
		height : 250,
		autowidth : true,
		shrinkToFit : false,
		forceFit : true,
		viewrecords : false,
		gridview : true,
		loadonce : true,
		rowNum: 10,
		loadComplete : function() {
			var newWidth = $(grid).closest(".ui-jqgrid").parent().width();
			$(grid).jqGrid("setGridWidth", newWidth, true);
			$(grid).trigger("resize");
		},
		styleUI : "Bootstrap",
		datatype : 'local',
		pager : pager
	});
}

const createAltaRelPager = (grid, pager) => {
	$(grid).navGrid(pager, {
		edit: false,
		add: false,
		del: false,
		search: false,
		refresh: false
	},
			// Edit Dialog
			null,
			// Add Dialog
			null,
			// Delete Dialog
			null
			);
			
	$(grid).navButtonAdd(pager, {
		buttonicon : "glyphicon glyphicon-trash",
		title : "Eliminar",
		caption : "",
		position : "first",
		onClickButton : function() {
			let selectedRow = $(grid).jqGrid("getGridParam", 'selrow');
			if (selectedRow) {
				$(grid).jqGrid('delRowData', selectedRow);
			}
		}
	});
}

function getAutocompleteOpts(url, callBack) {
//	var selectedAutocompOpt;
	var options = {
		url : function(phrase) {
			if (phrase.length > 3) {
				return url +  phrase + ".html";
			}
		},
		getValue : "valor",
		list: {
			onClickEvent: function() {
				callBack(this);
			}
		}
	};
	return options;
}

function getAutocompleteOpts2(url, callBack) {
	console.log(paisSelected);
	var options = {
		url: function (phrase) {
			if (phrase.length > 3) {
				return url + phrase + "/" + paisSelected + ".html";
			}
		},
		getValue: "valor",
		list: {
			onClickEvent: function () {
				callBack(this);
			}
		}
	};
	return options;
}

function showAlert(message) {
	var alertConfirm = $("#alertConfirmar");
	alertConfirm.find('#messageModal').html(message);
	alertConfirm.modal("show");
}