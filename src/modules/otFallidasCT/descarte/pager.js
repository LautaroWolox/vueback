function createotFallidasPager(grid, pager) {
	$(grid).navGrid(pager, pagerDefaultOptions,
			// Edit Dialog
			null,
			// Add Dialog
			null,
			// Delete Dialog
			null);

			//AGREGO BOTON EXCLUIR JULIAN
	$(grid).navButtonAdd(pager, {
		buttonicon : "glyphicon glyphicon-trash",
		title : "Excluir",
		caption : "",
		position : "first",
		onClickButton : function() {
			$("#excluirOtFallidaMotivos").val('');
			$("#notaExclusionFallida").val('');
			var arrData = [];
			var arrDataStr;
			let selectedRows = $(grid).jqGrid("getGridParam", "selarrrow");
			var arrSelectedRows = $(grid).jqGrid("getGridParam", 'selarrrow');
			let rowSelCount = 0;
			if(selectedRows) {
				rowSelCount=selectedRows.length;
			}
			if(rowSelCount>0) {
				var selectedRow = $(grid).jqGrid("getGridParam", 'selrow');
				if (selectedRow) {
					selectedRowData = jQuery(grid).getRowData(selectedRow);
					let alertConfirm = $("#modalExcluirOtFallida");
					alertConfirm.find('.messageModal').html('Confirma que desea excluir la OT seleccionada?');
					alertConfirm.modal("show");
				}
			} else {
				if(rowSelCount===0) {
					$("#msgSeleccionFallidas").modal("show");
				}
			}
		}
	});
	$(grid).navButtonAdd(pager, {
		id:"_reproBtn",
		title : "",
		caption : "Reprocesar",
		onClickButton : function() {
			var arrData = [];
			var arrDataStr;
			var selectedRow = $(grid).jqGrid("getGridParam", 'selrow');
			var arrSelectedRows = $(grid).jqGrid("getGridParam", 'selarrrow');

			if (!selectedRow || !arrSelectedRows.length) {
				$("#msgSeleccion").modal("show");
				return;
			}
			$('#_reproBtn').addClass('ui-state-disabled');
			toggleLoader();
			for (var i = 0; i < arrSelectedRows.length; i++) {
				var curr = $(grid).getRowData(arrSelectedRows[i]);
				arrData.push(curr.id); // arrData.push(curr["nroOrdenTrabajo"]);
			}
			arrDataStr = JSON.stringify(arrData);
			$.post( "registroOTFallidasReproceso/reprocesar.html", { arrDataStr: arrDataStr }, function() {
				// $("#btnBuscar").click(); //Refrescando la busqueda
				let filtrosBusqueda = $("#filtrosForm :input").serialize() + "&sinFiltros="+false;
				initotFallidasGrid("registroOTFallidasReproceso/searchFallidas.html", filtrosBusqueda, 1);
				$('#_reproBtn').removeClass('ui-state-disabled');
			});
			toggleLoader();
		}
	});
	let colsToShow=["nota", "incluirExp"];
	let colsToHide=["tieneNota", "incluir"];
	initExportWithColsToShowOrHide(grid, pager, 'Ot_FallidasReproceso.xlsx',0,colsToShow,colsToHide);
}

let selectedAutocompOpt;

const descheckearDisabled = (grid) => {
	$(grid).find("td.disabled").each(function(){
		$(this).find("input:checkbox").each(function(){
			$(this).prop("checked", false);
		});
		$(this).parent().removeClass("success");
	});
}