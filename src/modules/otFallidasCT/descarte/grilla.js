function getOtFallidasModels() {
	return gridModel = [ {
		label : 'ID OT FALLIDAS',
		name : 'id',
		index : 'id',
		hidden: true
	},
	{
		label : 'Nro. OT',
		name : 'nroOrdenTrabajo',
		index : 'nroOrdenTrabajo',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 25
		},
		searchoptions : soptText
	},
	{
		label : 'FECHA CIERRE',
		name : 'fechaCierre',
		index : 'fechaCierre',
		coloptions : generalColoptions,
		editable : false,
		sortable : true,
		sorttype : 'date',
		formatter : 'date',
		formatoptions : {
			srcformat : 'd/m/Y H:i',
			newformat : 'd/m/Y H:i'
		},
		searchoptions : soptText
	},
	{
		label : 'COD TAREA',
		name : 'tareaCodigo',
		index : 'tareaCodigo',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 50
		},
		searchoptions : soptText
	},
	{
		label : 'DIRECCION',
		name : 'direccion',
		index : 'direccion',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 50
		},
		searchoptions : soptText
	},
	{
		label : 'CIUDAD',
		name : 'ciudad',
		index : 'ciudad',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 50
		},
		searchoptions : soptText
	},
	{
		label : 'PROVINCIA',
		name : 'provincia',
		index : 'provincia',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 50
		},
		searchoptions : soptText
	},	
	{
		label : 'REGION',
		name : 'region',
		index : 'region',
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
			maxlength : 25
		},
		searchoptions : soptText
	},
	{
		label : 'CONTRATISTA',
		name : 'contratista',
		index : 'contratista',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 50
		},
		searchoptions : soptText
	},
	{
		label : 'TECNICO CIERRE',
		name : 'tecnicoCierre',
		index : 'tecnicoCierre',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 50
		},
		searchoptions : soptText
	},
	{
		label : 'ACTIVIDADES',
		name : 'actividades',
		index : 'actividades',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 500
		},
		searchoptions : soptText
	},
	{
		label : 'SISTEMA ORIGEN',
		name : 'sistemaOrigen',
		index : 'sistemaOrigen',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 50
		},
		searchoptions : soptText
	},
	{
		label : 'DESCRIPCION ERROR',
		name : 'errorDescripcion',		//mensajeError
		index : 'errorDescripcion',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 25
		},
		searchoptions : soptText
	},
	{
		label : 'EXCLUIDA',
		name : 'excluida',		
		index : 'excluida',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 2
		},
		searchoptions : soptText
	},	
	{
		label : 'MOTIVO_EXCLUSION',
		name : 'motivoExclusion',		
		index : 'motivoExclusion',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 25
		},
		searchoptions : soptText
	},	
		{
		label : 'NOTA',
		name : 'nota',
		index : 'nota',
		hidden:true
	},
	{
		label : 'NOTA',
		name : 'tieneNota',
		index : 'tieneNota',
		coloptions : generalColoptions,
		editable : true,
		editoptions : {
			maxlength : 2
		},
		searchoptions : soptText,
		formatter : function(cellvalue, options, rowObject) {
			let icon = "";
			icon = "<div class='notebook-icon'></div>";
			return icon;
		},
		cellattr: function (rowId, val, rawObject, cm, rdata) {
			if (rawObject.excluida === "N") {
				return "class='text-center'";
			}
		}	
	},
			{
		label : 'INCLUIR',
		name : 'incluirExp',
		index : 'incluirExp',
		hidden:true
	},
	{
		label : 'INCLUIR',
		name : 'incluir',
		index : 'incluir',
		searchoptions : soptText,
		formatter : function(cellvalue, options, rowObject) {
			let icon = "";
			if (rowObject.excluida === "S") {
				icon = "<div class='inclusion-icon'></div>";
			} else {
				icon = "-"
			}
			return icon;
		},
		cellattr: function (rowId, val, rawObject, cm, rdata) {
			if (rawObject.excluida === "N") {
				return "class='text-center'";
			}
		}
		
	}
	];
}