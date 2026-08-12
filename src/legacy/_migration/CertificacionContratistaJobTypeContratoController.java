package ar.com.telecom.pc.controller;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.ws.rs.QueryParam;

import ar.com.telecom.pc.adapter.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

import ar.com.telecom.pc.model.Perfil;
import ar.com.telecom.pc.model.PerfilMenunode;
import ar.com.telecom.pc.model.Usuario;
import ar.com.telecom.pc.service.CertificacionContratistaService;
import ar.com.telecom.pc.service.MenuService;
import ar.com.telecom.pc.util.Constante;

@Scope("session")
@Controller	
@EnableWebMvc
public class CertificacionContratistaJobTypeContratoController {

	@Inject
	private Usuario usuario;

	@Autowired
	private MenuService menuService;
	
	@Autowired
	private CertificacionContratistaService certificacionContratistaService;

	@RequestMapping(value = "/jobtypeContrato.html", method = RequestMethod.GET)
	public ModelAndView cargarAdminPerfiles(HttpServletRequest request, HttpServletResponse response, HttpSession session) {

		PerfilMenunode perfilMenunode = usuario.getPerfil().stream().map(Perfil::getPerfilMenunodes).flatMap(Collection::stream).filter(pm -> pm.getMenunode().getNombreCorto().equals(Constante.MENU_CCONTRATISTA_JOBTYPE_CONTRATO_NOMBRECORTO)).findFirst().get();
		ModelAndView mv = new ModelAndView("certificacionContratistaJobTypeContrato");
		mv.addObject("filtros", new FiltrosBusquedaCertificacionContratistaWorkAroundAdapter());
		mv.addObject("generalPagerOptions", menuService.obtenerMenunodePager(perfilMenunode).getPagerOpts());
		return mv;
	}
	
	@ResponseBody
	@RequestMapping(value = "/jobtypeContrato/getJobTypes.html", method = RequestMethod.GET)
	public List<JobTypeContratoAdapter> getJobTypes() {
		List<JobTypeContratoAdapter> adapterLst = new ArrayList<JobTypeContratoAdapter>();
		try {
			adapterLst = certificacionContratistaService.getJobTypes();
			
		} catch (Exception e) {
			e.printStackTrace();
			throw new Error(e);
		}

		return adapterLst;
	}
	
	@ResponseBody
	@RequestMapping(value = "/jobtypeContrato/actualizarJobtype.html", method = RequestMethod.GET)
	public JobTypeContratoAdapter updateJobTypeContrato(
			@RequestParam(value="tareaContratoId", required = true) Long tareaContratoId,
			@RequestParam(value="tipoContratoId", required = true) Long tipoContratoId) {

		JobTypeContratoAdapter adapter = new JobTypeContratoAdapter();
		
		String legajo = usuario.getLegajo();
	
		adapter = certificacionContratistaService.updateJobTypeContrato(legajo, tareaContratoId, tipoContratoId);
		
		return adapter;
	}

	@ResponseBody
	@RequestMapping(value = "/jobtypeContrato/nuevaRelJobtypeContrato.html", method = RequestMethod.POST)
	public List<JobTypeContratoErrorAdapter> nuevaRelacionJobtypeContrato(HttpServletRequest request) {

		String legajo = usuario.getLegajo();
		
		List<JobTypeContratoAdapter> adapters = new ArrayList<JobTypeContratoAdapter>();
		List<JobTypeContratoErrorAdapter> errores = new ArrayList<JobTypeContratoErrorAdapter>();
		
		//Esto se itera asì
		String menusStr = request.getParameterMap().get("nuevasRelaciones")[0];
		JsonArray jarray = new JsonParser().parse(menusStr).getAsJsonArray();
		for (JsonElement jsonElement : jarray) {
		
			JobTypeContratoAdapter adapter = new JobTypeContratoAdapter();

			adapter.setTareaCodigo(jsonElement.getAsJsonObject().get("relCodigoTarea").getAsString());
			adapter.setTareaNombre(jsonElement.getAsJsonObject().get("relTarea").getAsString());

			adapter.setContratoTipoId(jsonElement.getAsJsonObject().get("relContratoId").getAsLong());			
			adapter.setContratoNombre(jsonElement.getAsJsonObject().get("relContrato").getAsString());			

			adapter.setPais(jsonElement.getAsJsonObject().get("pais").getAsString());

			adapters.add(adapter);
		}
		
		errores = certificacionContratistaService.nuevaRelacionJobtypeContrato(legajo, adapters);		
		
		return errores;
	}

	@ResponseBody
	@RequestMapping(value = "/jobtypeContrato/getJobTypeTarea/{phrase}/{fullSelected}.html", method = RequestMethod.GET)
	public List<CertificacionJobtypeAdapter> getJobTypeTarea3(@PathVariable(value = "fullSelected") String fullSelected, @PathVariable(value = "phrase") String phrase) {
		List<CertificacionJobtypeAdapter> adapterList = new ArrayList<CertificacionJobtypeAdapter>();
		List<JobTypeTareaAdapter> adapterTareaList = certificacionContratistaService.getJobTypeTareaByNombre(fullSelected, phrase);
		for (JobTypeTareaAdapter adapter : adapterTareaList) {

			CertificacionJobtypeAdapter certificacionJobtypeAdapter = new CertificacionJobtypeAdapter();
			certificacionJobtypeAdapter.setId(adapter.getId());
			certificacionJobtypeAdapter.setCodigo(adapter.getCodigo());
			certificacionJobtypeAdapter.setNombre(adapter.getNombre());
			adapterList.add(certificacionJobtypeAdapter);
		}
		return adapterList;
	}

//	@ResponseBody
//	@RequestMapping(value = "/jobtypeContrato/getJobTypeTarea", method = RequestMethod.GET)
//	public List<CertificacionJobtypeAdapter> getJobTypeTarea2(@QueryParam("phrase") String phrase, @RequestParam("fullSelected") String fullSelected) {
//		List<CertificacionJobtypeAdapter> adapterList = new ArrayList<CertificacionJobtypeAdapter>();
//		List<JobTypeTareaAdapter> adapterTareaList = certificacionContratistaService.getJobTypeTareaByNombre(fullSelected, phrase);
//		for (JobTypeTareaAdapter adapter : adapterTareaList) {
//
//			CertificacionJobtypeAdapter certificacionJobtypeAdapter = new CertificacionJobtypeAdapter();
//			certificacionJobtypeAdapter.setId(adapter.getTareaId());
//			certificacionJobtypeAdapter.setCodigo(adapter.getCodigo());
//			certificacionJobtypeAdapter.setNombre(adapter.getNombre());
//			adapterList.add(certificacionJobtypeAdapter);
//		}
//		return adapterList;
//	}

	@ResponseBody
	@RequestMapping(value = "/jobtypeContrato/getJobTypeTarea/{phrase}.html", method = RequestMethod.GET)
	public List<CertificacionJobtypeAdapter> getJobTypeTarea(@PathVariable(value = "phrase") String phrase) {
		List<CertificacionJobtypeAdapter> adapterList = new ArrayList<CertificacionJobtypeAdapter>();
		List<JobTypeTareaAdapter> adapterTareaList = certificacionContratistaService.getJobTypeTareaByNombre(phrase);
		for (JobTypeTareaAdapter adapter : adapterTareaList) {

			CertificacionJobtypeAdapter certificacionJobtypeAdapter = new CertificacionJobtypeAdapter();
			certificacionJobtypeAdapter.setId(adapter.getId());
			certificacionJobtypeAdapter.setCodigo(adapter.getCodigo());
			certificacionJobtypeAdapter.setNombre(adapter.getNombre());
			adapterList.add(certificacionJobtypeAdapter);
		}
		return adapterList;
	}
	@ResponseBody
	@RequestMapping(value = "/jobtypeContrato/getAllJobTypeTarea/{fulfillment}/{phrase}.html", method = RequestMethod.GET)
	public List<CertificacionJobtypeAdapter> getAllJobTypeTarea(@PathVariable(value = "fulfillment") String fulfillment,
																@PathVariable(value = "phrase") String phrase) {
		List<CertificacionJobtypeAdapter> adapterList = new ArrayList<CertificacionJobtypeAdapter>();
		List<JobTypeTareaAdapter> adapterTareaList = certificacionContratistaService.getAllJobTypeTareaByNombre(phrase,fulfillment.charAt(0));
		for (JobTypeTareaAdapter adapter : adapterTareaList) {
			CertificacionJobtypeAdapter certificacionJobtypeAdapter = new CertificacionJobtypeAdapter();
			certificacionJobtypeAdapter.setId(adapter.getId());
			certificacionJobtypeAdapter.setCodigo(adapter.getCodigo());
			certificacionJobtypeAdapter.setNombre(adapter.getNombre());
			adapterList.add(certificacionJobtypeAdapter);
		}
		return adapterList;
	}

	@ResponseBody	
	@RequestMapping(value = "/jobtypeContrato/getContrato/{phrase}.html", method = RequestMethod.GET)
	public List<CertificacionContratoAdapter> getContrato(@PathVariable(value = "phrase") String phrase) {
		List<CertificacionContratoAdapter> adapterList = new ArrayList<CertificacionContratoAdapter>();
		adapterList = certificacionContratistaService.busquedaContrato(phrase);
		return adapterList;
	}

	@ResponseBody
	@RequestMapping(value = "jobtypeContrato/desactivarRelJobContrato.html", method = RequestMethod.POST)
	public JobTypeContratoAdapter desactivarRelJobContrato(@RequestParam long idRelacion) {
		String legajo = usuario.getLegajo();
		return certificacionContratistaService.desactivarRelJobContrato(legajo, idRelacion);
	}

}
