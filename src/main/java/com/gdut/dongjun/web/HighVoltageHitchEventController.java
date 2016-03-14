package com.gdut.dongjun.web;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.gdut.dongjun.domain.po.HighVoltageHitchEvent;
import com.gdut.dongjun.domain.po.User;
import com.gdut.dongjun.service.HighVoltageHitchEventService;
import com.gdut.dongjun.service.net_server.CtxStore;
import com.gdut.dongjun.service.net_server.SwitchGPRS;
import com.gdut.dongjun.util.MapUtil;
import com.gdut.dongjun.util.MyBatisMapUtil;

@Controller
@RequestMapping("/dongjun")
public class HighVoltageHitchEventController {

	@Autowired
	private HighVoltageHitchEventService hitchEventService;


	/**
	 * 
	 * @Title: getLineSwitchList
	 * @Description: TODO
	 * @param @param lineId
	 * @param @param model
	 * @param @return
	 * @return String
	 * @throws
	 */
	@RequestMapping("/high_voltage_hitch_event_manager")
	public String getLineSwitchList(String switchId, Model model) {

		List<HighVoltageHitchEvent> events = null;
		if (switchId != null) {

			events = hitchEventService.selectByParameters(MyBatisMapUtil.warp(
					"switch_id", switchId));
		} else {
			events = hitchEventService.selectByParameters(null);
		}
		model.addAttribute("hitch_events", events);
		return "high_voltage_hitch_event_manager";
	}

	/**
	 * 
	 * @Title: getEventList
	 * @Description: TODO
	 * @param @param switchId
	 * @param @param model
	 * @param @return
	 * @return Object
	 * @throws
	 */
	@RequestMapping("/get_high_voltage_hitch_event_by_switch_id")
	@ResponseBody
	public Object getEventList(String switchId, Model model) {

		List<HighVoltageHitchEvent> events = null;
		if (switchId != null) {

			events = hitchEventService.selectByParameters(MyBatisMapUtil.warp(
					"switch_id", switchId));
		} else {
			events = hitchEventService.selectByParameters(null);
		}
		HashMap<String, Object> map = (HashMap<String, Object>) MapUtil.warp(
				"draw", 1);
		int size = events.size();
		map.put("recordsTotal", size);
		map.put("data", events);
		map.put("recordsFiltered", size);
		return map;
	}

	@RequestMapping("/update_hitchEvent")
	@ResponseBody
	public Object updateHitchEvent(@RequestParam(required=false)String switchId,
			String solveTime, String solvePeople) {
		
		List<HighVoltageHitchEvent> list = hitchEventService.
				selectByParameters(MyBatisMapUtil.warp("switch_id", switchId));
		System.out.println();
		if(list != null && list.size() != 0) {
			
			HighVoltageHitchEvent hitchEvent = list.get(0);
			hitchEvent.setSolveTime(new Date());
			hitchEvent.setSolvePeople(solvePeople);
			hitchEventService.updateByPrimaryKey(hitchEvent);
			
			return MapUtil.warp("success", "true");
		} else {
			
			return MapUtil.warp("success", "false");
		}
	}
	
	@RequestMapping("/ignore_hitch_event") 
	@ResponseBody
	public Object ignoreHitchEvent(@RequestParam(required = true)String switchId, HttpSession session) {
		
		if(CtxStore.changeOpen(switchId)) {
			HighVoltageHitchEvent event = hitchEventService.getRecentHitchEvent(switchId);
			if(event != null) {
				event.setSolveWay("忽略");
				event.setSolveTime(new Date());
				event.setSolvePeople(((User)session.getAttribute("currentUser")).getName());
				hitchEventService.updateByPrimaryKeySelective(event);
			}
		}
		return MapUtil.warp("success", true);
	}
}
