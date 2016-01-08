package com.gdut.dongjun.web;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.gdut.dongjun.service.ControlMearsureCurrentService;
import com.gdut.dongjun.service.ControlMearsureVoltageService;
import com.gdut.dongjun.service.HighVoltageCurrentService;
import com.gdut.dongjun.service.HighVoltageVoltageService;
import com.gdut.dongjun.service.LowVoltageCurrentService;
import com.gdut.dongjun.service.LowVoltageVoltageService;

@Controller
@RequestMapping("/dongjun")
public class ChartController {

	@Autowired
	private LowVoltageCurrentService currentService;
	@Autowired
	private LowVoltageVoltageService voltageService;
	@Autowired
	private HighVoltageCurrentService currentService2;
	@Autowired
	private HighVoltageVoltageService voltageService2;
	@Autowired
	private ControlMearsureCurrentService currentService3;
	@Autowired
	private ControlMearsureVoltageService voltageService3;

	/**
	 * 
	 * @Title: currentChart
	 * @Description: TODO
	 * @param @param switchId
	 * @param @return
	 * @return Object
	 * @throws
	 */
	@RequestMapping("/current_chart")
	@ResponseBody
	public Object currentChart(@RequestParam(required = true) String switchId) {

		return currentService.selectBySwitchId(switchId);

	}

	/**
	 * 
	 * @Title: voltageChart
	 * @Description: TODO
	 * @param @param switchId
	 * @param @return
	 * @return Object
	 * @throws
	 */
	@RequestMapping("/voltage_chart")
	@ResponseBody
	public Object voltageChart(@RequestParam(required = true) String switchId) {

		return voltageService.selectBySwitchId(switchId);

	}

	/**
	 * 
	 * @Title: selectChartByDate
	 * @Description: deporte
	 * @param @param search_date
	 * @param @return
	 * @return Object
	 * @throws
	 */
	@RequestMapping("/select_chart_by_date")
	@ResponseBody
	public Object selectChartByDate(
			@RequestParam(required = true) String switchId, String beginDate,
			String endDate) {

		Map<String, Object> map = new HashMap<String, Object>();

		map.put("current",
				currentService.selectByTime(switchId, beginDate, endDate));
		map.put("voltage",
				voltageService.selectByTime(switchId, beginDate, endDate));
		return map;
	}

	@RequestMapping("/select_chart_by_switch_id")
	@ResponseBody
	public Object selectChartBySwitchId(
			@RequestParam(required = true) String switchId,
			@RequestParam(required = true) String type, String beginDate,
			String endDate) {

		Map<String, Object> map = new HashMap<String, Object>();

		if (beginDate == null || beginDate == "") {// 使用当前日期
			SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd");// 设置日期格式
			beginDate = df.format(new Date());
		}
		if (endDate == null || endDate == "") {// 使用当前日期
			SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd");// 设置日期格式
			endDate = df.format(new Date());
		}

		if (type == null) {
			type = "0";
		}
		switch (type) {
		case "0":
			map.put("current",
					currentService.selectByTime(switchId, beginDate, endDate));
			map.put("voltage",
					voltageService.selectByTime(switchId, beginDate, endDate));
			break;
		case "1":
			map.put("current",
					currentService2.selectByTime(switchId, beginDate, endDate));
			map.put("voltage",
					voltageService2.selectByTime(switchId, beginDate, endDate));
			break;
		case "2":
			map.put("current",
					currentService3.selectByTime(switchId, beginDate, endDate));
			map.put("voltage",
					voltageService3.selectByTime(switchId, beginDate, endDate));
			break;

		default:
			break;
		}
		return map;
	}

}
