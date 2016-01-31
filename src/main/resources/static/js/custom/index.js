$(document).ready(function() {

	// 初始化ZTree
	$.fn.zTree.init($("#treeDemo"), set_tree(0));// 0表示默认显示低压的数据

	// 添加搜索栏监听
	$("#searchNode").click(function() {

		zTreeSearch($("#search_node_key").val());
	});

	// 切换ZTree显示的开关种类
	$("#zTree_node_type").change(function() {

		$.fn.zTree.getZTreeObj("treeDemo").destroy();
		$.fn.zTree.init($("#treeDemo"), set_tree(this.value));

	})

	// 轮询报警
	hitchEventSpy();

  // 5秒后报警测试
  //setTimeout(function () {
  //  hitchEventSpy();
  //}, 5000);

});

/**
 * 
 * @Title: 设置ZTree属性
 * @Description: TODO
 * @param
 * @returns {___anonymous258_608}
 * @return ___anonymous258_608
 * @throws
 */
function set_tree(zTreeNodeType) {

	var setting = {
		async : {
			enable : true,
			url : "switch_tree",// 数据源
			autoParam : [ "id", "name=n", "level=lv" ],
			otherParam : {
				"type" : zTreeNodeType,// 0低压 1高压 2管测
			},
			dataFilter : data_filter,// 添加节点名称过滤器
		},
		callback : {
			onAsyncSuccess : zTreeOnAsyncSuccess,// 添加动态加载成功回调函数
			onClick : zTreeOnClick,// 添加节点点击事件回调函数
		},
		view : {
			showLine : false,
			fontCss : getFontCss
		// 设置颜色
		}
	};
	return setting;
}

/**
 * 
 * @Title: 节点名称过滤
 * @Description: TODO
 * @param
 * @param treeId
 * @param
 * @param parentNode
 * @param
 * @param childNodes
 * @param
 * @returns
 * @return any
 * @throws
 */
function data_filter(treeId, parentNode, childNodes) {
	if (!childNodes)
		return null;
	for (var i = 0, l = childNodes.length; i < l; i++) {
		childNodes[i].name = childNodes[i].name.replace(/\.n/g, '.');
	}
	return childNodes;
}

/**
 * 
 * @Title: 选择过滤器
 * @Description: 第二层的子节点
 * @param
 * @param node
 * @param
 * @returns {Boolean}
 * @return Boolean
 * @throws
 */
function switch_filter(node) {
	return (node.level == 2);
}

/**
 * 
 * @Title: 搜索ZTree节点
 * @Description: TODO
 * @param
 * @param value
 * @return void
 * @throws
 */
var last_value;// 存储上一个搜索的关键字
function zTreeSearch(value) {

	var zTree = $.fn.zTree.getZTreeObj("treeDemo");
	var nodeList;
	if (last_value != null) {

		nodeList = zTree.getNodesByParamFuzzy("name", last_value);
		update(nodeList, 0);// 重置状态
	}
	last_value = value;

	nodeList = zTree.getNodesByParamFuzzy("name", value);
	update(nodeList, 1);
	
	if(nodeList.length == 0){
		
		if (last_value != null) {

			nodeList = zTree.getNodesByParamFuzzy("address", last_value);
			update(nodeList, 0);// 重置状态
		}
		last_value = value;

		nodeList = zTree.getNodesByParamFuzzy("address", value);
		update(nodeList, 1);
	}
}

/**
 * 
 * @Title: 搜索节点，高亮显示节点
 * @Description: TODO
 * @param
 * @param nodes
 * @param
 * @param highlight
 * @return void
 * @throws
 */
function update(nodes, highlight) {

	var zTree = $.fn.zTree.getZTreeObj("treeDemo");

	for (var i = 0, l = nodes.length; i < l; i++) {

		nodes[i].highlight = highlight;
		zTree.updateNode(nodes[i]);
	}
}

/**
 * 
 * @Title: getFontCss
 * @Description: TODO
 * @param
 * @param treeId
 * @param
 * @param treeNode
 * @param
 * @returns
 * @return any
 * @throws
 */
function getFontCss(treeId, treeNode) {

	if (treeNode.highlight == 0) {

		return {
			color : "#999999",
			"font-weight" : "bold"
		}
	} else if (treeNode.highlight == 1) {// 搜索

		return {
			color : "#5C297F",
			"font-weight" : "bold"
		}
	} else if (treeNode.highlight == 2) {// 报警

		return {
			color : "red",
			"font-weight" : "bold"
		}
	}
}

/**
 * 
 * @Title: zTree节点重定位
 * @Description: TODO
 * @param
 * @param event
 * @param
 * @param treeId
 * @param
 * @param treeNode
 * @return void
 * @throws
 */
var polylines = new Array();// 旧的线
function zTreeOnClick(event, treeId, treeNode) {

	// 地图定位
	map.panTo(new BMap.Point(treeNode.longitude, treeNode.latitude));

	var url;
	var type = $("#zTree_node_type").val();
	switch (type) {

	case '0':
		url = "selectLVByLineIdInAsc";
		break;
	case '1':
		url = "selectHVByLineIdInAsc";
		break;
	case '2':
		url = "selectCMByLineIdInAsc";
		break;
	}

	// 隐藏旧的线路
	if (polylines != null && polylines.length != 0) {

		for (var i = 0; i < polylines.length - 1; i++) {

			if (polylines != null && polylines[i] != null) {

				polylines[i].hide();
			}
		}
	}

	// 描绘新的线路
	$.ajax({
		type : "post",
		url : url,
		async : false,
		data : {
			"lineId" : treeNode.lineId
		},
		success : function(data) {

			for (var i = 0; i < data.length - 1; i++) {

				if (data[i] != null && data[i + 1] != null) {

					var point1 = new BMap.Point(data[i].longitude,
							data[i].latitude);
					var point2 = new BMap.Point(data[i + 1].longitude,
							data[i + 1].latitude);

					drawLine(point1, point2, i, map);
				}
			}
		}

	})

};

/**
 * 
 * @Title: drawLine
 * @Description: TODO
 * @param
 * @param point1
 * @param
 * @param point2
 * @param
 * @param map
 * @return void
 * @throws
 */
function drawLine(point1, point2, i, map) {

	var polyline = new BMap.Polyline([ point1, point2 ], {
		strokeColor : "blue",
		strokeWeight : 2,
		strokeOpacity : 0.5
	});
	map.addOverlay(polyline); // 增加折线
	polylines[i] = polyline;// 记录旧的线
}

var map = new BMap.Map("baidu_map"); // 创建地图实例
var nodes;// 所有的节点
//var worning_switch = "../../ico/worning_switch.jpg";// 报警状态的图标
var worning_switch = '../../ico/tuDing.gif'; // 更新报警图标，为动图
var close_switch = '../../ico/voltage-close.jpg';
/**
 * 
 * @Title: zTreeOnAsyncSuccess
 * @Description: ZTree成功渲染之后的回调函数，描绘定点
 * @param
 * @param event
 * @param
 * @param treeId
 * @param
 * @param treeNode
 * @param
 * @param msg
 * @return void
 * @throws
 */
function zTreeOnAsyncSuccess(event, treeId, treeNode, msg) {

	// var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
	// nodes = treeObj.getNodesByFilter(switch_filter); // 用选择过滤器查找节点集合
	var low_voltage_nodes = getAllLowVoltageSwitch();

	var point;
	var longitude = localStorage.getItem('longitude');
	var latitude = localStorage.getItem('latitude');

	if (longitude != null && latitude != null) {
		// 从localStorage中取值定位
		point = new BMap.Point(longitude, latitude);
	} else {
		// 否则用原始数据第一个定位
		point = new BMap.Point(low_voltage_nodes[0].longitude,
				low_voltage_nodes[0].latitude); // 创建点坐标
	}

	map.centerAndZoom(point, 13); // 初始化地图，设置中心点坐标和地图级别
	map.enableScrollWheelZoom();// 启滑轮缩放

	// *************************************************************
	// 遍历描绘定点
	// *************************************************************

	var voltage_switch_icon = "../../ico/voltage-outLine.jpg";// 低压开关的图标
	//var high_voltage_switch_icon = "../../ico/high_voltage_switch.jpg";// 高压开关的图标
	var control_measure_switch_icon = "../../ico/control_measure_switch.jpg";// 低压开关的图标

	//var outLine = "../../ico/high_voltage_switch.jpg";
	//var
	/* 改变描绘模式，不需要根据协议而描绘，只要是离线就灰图标，合闸就红图标，
	开闸就绿图标
	 */

	forDrawPoint(low_voltage_nodes, voltage_switch_icon,// 描绘低压开关
	click_low_voltage_switch);

	forDrawPoint(getAllHighVoltageSwitch(), voltage_switch_icon,// 描绘高压开关
	click_high_voltage_switch);

	forDrawPoint(getAllControlMeasureSwitch(), control_measure_switch_icon,// 描绘管测开关
	click_low_voltage_switch);

	// 添加地图类型和缩略图
	var mapType1 = new BMap.MapTypeControl({
		mapTypes : [ BMAP_NORMAL_MAP, BMAP_HYBRID_MAP ]
	});
	var mapType2 = new BMap.MapTypeControl({
		anchor : BMAP_ANCHOR_TOP_LEFT
	});

	var overView = new BMap.OverviewMapControl();
	var overViewOpen = new BMap.OverviewMapControl({
		isOpen : true,
		anchor : BMAP_ANCHOR_BOTTOM_RIGHT
	});

	map.addControl(mapType1); // 2D图，卫星图
	map.addControl(mapType2); // 左上角，默认地图控件
	// map.setCurrentCity("北京"); //由于有3D图，需要设置城市
	map.addControl(overView); // 添加默认缩略地图控件
	map.addControl(overViewOpen); // 右下角，打开

}

/**
 * 
 * @Title: getAllLowVoltageSwitch
 * @Description: TODO
 * @param
 * @returns
 * @return any
 * @throws
 */
function getAllLowVoltageSwitch() {

	var nodes;
	$.ajax({
		type : "post",
		url : "get_all_low_voltage_switch",
		async : false,
		data : {},
		success : function(data) {

			nodes = data;// 设置开关类型
			for (var i = 0; i < nodes.length; i++) {
				nodes[i].type = 0;
			}
		}
	})
	return nodes;
}

/**
 * 
 * @Title: getAllHighVoltageSwitch
 * @Description: TODO
 * @param
 * @returns
 * @return any
 * @throws
 */
function getAllHighVoltageSwitch() {

	var nodes;
	$.ajax({
		type : "post",
		url : "get_all_high_voltage_switch",
		async : false,
		data : {},
		success : function(data) {

			nodes = data;
			for (var i = 0; i < nodes.length; i++) {
				nodes[i].type = 1;
			}
		}
	})
	return nodes;
}

/**
 * 
 * @Title: getAllControlMeasureSwitch
 * @Description: TODO
 * @param
 * @returns
 * @return any
 * @throws
 */
function getAllControlMeasureSwitch() {

	var nodes;
	$.ajax({
		type : "post",
		url : "get_all_control_measure_switch",
		async : false,
		data : {},
		success : function(data) {

			nodes = data;
			for (var i = 0; i < nodes.length; i++) {
				nodes[i].type = 2;
			}
		}
	})
	return nodes;
}

/**
 * 
 * @Title: 遍历描绘定点
 * @Description: TODO
 * @param
 * @param nodes
 * @param
 * @param switch_icon
 * @param
 * @param click_function
 * @return void
 * @throws
 */
function forDrawPoint(nodes, switch_icon, click_function) {

	for (var i = 0; i < nodes.length; i++) {
		switchs_draw(nodes[i], switch_icon, click_function);
	}

}

/**
 * 
 * @Title: 描绘定点
 * @Description: TODO
 * @param
 * @param map
 * @param
 * @param node
 * @return void
 * @throws
 */
function switchs_draw(node, switch_icon, click_switch) {

	// var marker = new BMap.Marker(new BMap.Point(116.404, 39.915)); //创建点
	// map.addOverlay(marker); // 增加点

	// 创建标注
	var pt = new BMap.Point(node.longitude, node.latitude);
	var myIcon = new BMap.Icon(switch_icon, new BMap.Size(20, 20));
	var marker2 = new BMap.Marker(pt, {
		icon : myIcon
	}); // 创建标注
	// ****************************************************************
	marker2.id = node.id;// 设置id
	marker2.type = node.type;
	marker2.name = node.name;
	// mraker2.isWorning = false;//设置报警标志
	// ****************************************************************
	map.addOverlay(marker2); // 将标注添加到地图中

	// 添加文字提示
	var label = new BMap.Label(node.name, {
		offset : new BMap.Size(20, -18)
	});
	marker2.setLabel(label);

	// **************************************************************************
	// 添加图标点击事件,弹出窗口
	marker2.addEventListener("click", click_switch);
	// **************************************************************************

}

/**
 * 
 * @Title: click_low_voltage_switch
 * @Description: TODO
 * @param
 * @return void
 * @throws
 */
var old_icon = "";
var id;// 被点击的开关的id
var type;// 被点击的开关的type

function click_high_voltage_switch() {

	var content = "<div class='BDM_custom_popup'>" + "<h4>"
			+ this.name
			+ "</h4>"
			+ "<table class='table table-bordered table-condensed'>"
			+ "<tbody>"
			+ "<tr>"
			+ "<td></td><td>电压</td><td>电流</td>"
			+ "<td>过渡I段保护</td>"
			+ "<td id='guo_liu_yi_duan'></td>"
			+ "</tr>"
			+ "<tr>"
			+ "<td>A相</td><td id='a_phase_voltage' class='red'></td><td id='a_phase_current' class='red'></td>"
			+ "<td>过渡II段保护</td>"
			+ "<td id='guo_liu_er_duan'></td>"
			+ "</tr>"
			+ "<tr>"
			+ "<td>B相</td><td id='b_phase_voltage' class='red'></td><td id='b_phase_current' class='red'></td>"
			+ "<td>过渡III段保护</td>"
			+ "<td id='guo_liu_san_duan'></td>"
			+ "</tr>"
			+ "<tr>"
			+ "<td>C相</td><td id='c_phase_voltage' class='red'></td><td id='c_phase_current' class='red'></td>"
			+ "<td>零序过流保护</td>"
			+ "<td id='ling_xu_guo_liu_'></td>"
			+ "</tr>"
			+ "</tbody></table>"
			+ "<table class='table table-bordered table-condensed'>"
			+ "<tbody>"
			+ "<tr>"
			+ "<td>断路器位置</td>"
			+ "<td id='status'></td>"
			+ "<td>PT2过压告警</td>"
			+ "<td id='pt2_guo_ya'></td>"
			+ "<td>重合闸动作</td>"
			+ "<td id='chong_he_zha'></td>"
			+ "</tr>"
			+ "<tr>"
			+ "<td>PT1有压</td>"
			+ "<td id='pt1_you_ya'></td>"
			+ "<td>交流失电告警</td>"
			+ "<td id='jiao_liu_shi_dian'></td>"
			+ "<td>遥控复归</td>"
			+ "<td id='yao_kong_fu_gui'></td>"
			+ "</tr>"
			+ "<tr>"
			+ "<td>PT2有压</td>"
			+ "<td id='pt2_you_ya'></td>"
			+ "<td>手动合闸动作</td>"
			+ "<td id='shou_dong_he_zha'></td>"
			+ "<td>遥控器合闸</td>"
			+ "<td id='yao_kong_he_zha'></td>"
			+ "</tr>"
			+ "<tr>"
			+ "<td>PT1过压告警</td>"
			+ "<td id='pt1_guo_ya'></td>"
			+ "<td>手动分闸动作</td>"
			+ "<td id='shou_dong_fen_zha'></td>"
			+ "<td>遥控器分闸</td>"
			+ "<td id='yao_kong_fen_zha'></td>"
			+ "</tr>"
			+ "</tbody></table>"
			+ "<a id='close_switch_btn' class='btn btn-primary' onClick='security_modal(0)'>合闸</a>"
			+ "<a id='open_switch_btn' class='btn btn-primary' onClick='security_modal(1)'>分闸</a>"
			+ "</div>"

	// + "<div class='row'>"
	// + "<div class='span4 text-center'>"
	// + "<select id='cancel_control_type'>"
	// + "<option value='1'>取消预约跳闸</option>"
	// + "<option value='3'>取消预约合闸</option>"
	// + "<option value='5'>取消测试预约跳闸</option>"
	// + "</select> <a id='cancel_control_switch_btn' class='btn btn-primary'
	// onclick='cancelControlSwitch()'>确定</a>"
	// + "</div>" + "</div>" + "</div>";

	var opts = {
		width : 580, // 信息窗口宽度
		height : 340, // 信息窗口高度
	}
	// var currentInfoWindow = new InfoWindow(getMarkInfoView(marker), latLng,
	// -47);

	var infoWindow = new BMap.InfoWindow(content, opts); // 创建信息窗口对象
	this.openInfoWindow(infoWindow);

	// 窗口打开读取实时数据,switch_detail.js 中定义
	// ********************************************************************
	if (old_icon != "") {

		this.setIcon(old_icon);// 打开窗口就代表去处理了报警
	}
	// 还没有提报警处理的需求 ==！
	// ********************************************************************

	id = this.id;
	type = this.type;

	// 高压开关状态
	hvswitchStatusSpy(this.id);
	readCurrentVoltage(this.id, this.type);// 读取实时数据。。

	// 添加窗口关闭监听，停止读取实时数据
	infoWindow.addEventListener("close", function() {
		clearTimeout(k);
		clearTimeout(t);
	});

}

/**
 * 
 * @Title: security_modal
 * @Description: TODO
 * @param
 * @return void
 * @throws
 */
function security_modal(t) {

	$("#security_modal").modal('show');
	var timer;
	$("#secu_confirm_btn").click(function() {
		var wait = 6;
		timer = setInterval(function() {
			if (wait === 0) {

				// ajax
				$.ajax({
					type : "post",
					url : "security_confirm",
					async : false,
					data : {
						"controlCode" : $("#controlCode").val()
					},
					success : function(data) {

						if (data) {

							if (t == 1) {

								openSwitch(id, type);
							} else {

								closeSwitch(id, type);
							}
						} else {

							alert("安全密码错误！");
						}
					}
				});
				clearInterval(timer);
			} else {
				wait--
				$('#notice_msg').text("将在 " + wait + " 秒内执行！");
			}
		}, 1000);
	});

	$('#cancel_control').click(function() {
		clearInterval(timer);
	});
}

/**
 * 
 * @Title: click_low_voltage_switch
 * @Description: TODO
 * @param
 * @return void
 * @throws
 */
function click_low_voltage_switch() {

	// zTree.reAsyncChildNodes(null, "refresh");

	// var p = this.getPosition();

	var content = "<div class='BDM_custom_popup'>"
			+ "<h4>"
			+ this.name
			+ "</h4>"
			+ "<table class='table table-bordered table-condensed'>"
			+ "<thead><tr><th>开关控制</th><th>状态</th><th id='status'></th></tr></thead>"
			+ "<tbody>"
			+ "<tr><td></td><td>电压</td><td>电流</td></tr>"
			+ "<tr><td>A相</td><td id='a_phase_voltage' class='red'></td><td id='a_phase_current' class='red'></td></tr>"
			+ "<tr><td>B相</td><td id='b_phase_voltage' class='red'></td><td id='b_phase_current' class='red'></td></tr>"
			+ "<tr><td>C相</td><td id='c_phase_voltage' class='red'></td><td id='c_phase_current' class='red'></td></tr>"
			+ "</tbody></table>"
			+ "<a id='close_switch_btn' class='btn btn-primary' onClick='security_modal(0)'>合闸</a>"
			+ "<a id='open_switch_btn' class='btn btn-primary' onClick='security_modal(0)'>分闸</a>"
			+ "</div>"

	// + "<div class='row'>"
	// + "<div class='span4 text-center'>"
	// + "<select id='cancel_control_type'>"
	// + "<option value='1'>取消预约跳闸</option>"
	// + "<option value='3'>取消预约合闸</option>"
	// + "<option value='5'>取消测试预约跳闸</option>"
	// + "</select> <a id='cancel_control_switch_btn' class='btn btn-primary'
	// onclick='cancelControlSwitch()'>确定</a>"
	// + "</div>" + "</div>" + "</div>";

	var opts = {
		width : 380, // 信息窗口宽度
		height : 230, // 信息窗口高度
	}
	// var currentInfoWindow = new InfoWindow(getMarkInfoView(marker), latLng,
	// -47);

	var infoWindow = new BMap.InfoWindow(content, opts); // 创建信息窗口对象
	this.openInfoWindow(infoWindow);

	// 窗口打开读取实时数据,switch_detail.js 中定义
	// ********************************************************************
	if (old_icon != "") {

		this.setIcon(old_icon);// 打开窗口就代表去处理了报警
	}
	// 还没有提报警处理的需求 ==！
	// ********************************************************************

	id = this.id;
	type = this.type;

	// 绑定控制监听
	$("#open_switch_btn").click(function() {

		openSwitch(id, type);
	})

	$("#close_switch_btn").click(function() {

		closeSwitch(id, type);
	})

	// ********************************************************************
	readCurrentVoltage(this.id, this.type);// 读取实时数据。。
	// ********************************************************************

	readlvSwitchStatus(this.id);

	// 添加窗口关闭监听，停止读取实时数据
	infoWindow.addEventListener("close", function() {
		clearTimeout(h);
		clearTimeout(t);
	});

}

/**
 * 
 * @Title: readlvSwitchStatus
 * @Description: TODO
 * @param
 * @param id
 * @return void
 * @throws
 */
function readlvSwitchStatus(id) {

	$.ajax({
		type : "post",
		url : "read_lvswitch_status",
		async : false,
		data : {

			"id" : id
		},
		success : function(data) {

			if (data == null || data == "") {

				$("#status").text("离线");
			} else if (data.isOpen) {

				$("#status").text("分");
			} else {

				$("#status").text("合");
			}
		}
	})

	h = setTimeout(function() {
		readlvSwitchStatus(id);
	}, 6 * 1000);
}

/**
 * 
 * @Title: hvswitchStatusSpy
 * @Description: TODO
 * @param
 * @param id
 * @return void
 * @throws
 */
function hvswitchStatusSpy(id) {

	$.ajax({
		type : "post",
		url : "read_hvswitch_status",
		async : false,
		data : {

			"id" : id,
		},
		success : function(data) {

			if (data == null || data == "") {

				$("#status").text("离线");
			} else {

				$("#guo_liu_yi_duan").addClass(
						green_or_red(data.guo_liu_yi_duan));
				$("#guo_liu_er_duan").addClass(
						green_or_red(data.guo_liu_er_duan));
				$("#guo_liu_san_duan").addClass(
						green_or_red(data.guo_liu_san_duan));

				$("#pt1_you_ya").addClass(green_or_red(data.pt1_you_ya));
				$("#pt2_you_ya").addClass(green_or_red(data.pt2_you_ya));
				$("#pt1_guo_ya").addClass(green_or_red(data.pt1_guo_ya));
				$("#pt2_guo_ya").addClass(green_or_red(data.pt2_guo_ya));

				$("#shou_dong_he_zha").addClass(
						green_or_red(data.shou_dong_he_zha));
				$("#shou_dong_fen_zha").addClass(
						green_or_red(data.shou_dong_fen_zha));

				$("#yao_kong_fu_gui").addClass(
						green_or_red(data.yao_kong_fu_gui));
				$("#yao_kong_fen_zha").addClass(
						green_or_red(data.yao_kong_fen_zha));
				$("#yao_kong_he_zha").addClass(
						green_or_red(data.yao_kong_he_zha));

				$("#jiao_liu_shi_dian").addClass(
						green_or_red(data.jiao_liu_shi_dian));
				$("#chong_he_zha").addClass(green_or_red(data.chong_he_zha));
				$("#ling_xu_guo_liu_").addClass(
						green_or_red(data.ling_xu_guo_liu_));

				if (data.status == "00") {

					$("#status").text("分");
				} else if (data.status == "01") {

					$("#status").text("合");
				}

			}
		}
	})
	k = setTimeout(function() {
		hvswitchStatusSpy(id);
	}, 6 * 1000);
}

/**
 * 
 * @Title: hitchEventSpy
 * @Description: TODO
 * @param
 * @return void
 * @throws
 */
<<<<<<< HEAD
//var worning_switch = "../../ico/worning_switch.jpg";// 报警状态的图标
var worning_switch = '../../ico/tuDing.gif'; // 更新报警图标，为动图
var close_switch = '../../ico/voltage-close.jpg'; // 更新合闸图标
var statusReset = 0; // 一个参数，用于判断是否重新描绘各个点
function hitchEventSpy() {

	if(statusReset) { zTreeOnAsyncSuccess() };
=======

function hitchEventSpy() {
	
>>>>>>> a4e3b7a445bea9a4ed14b1075d53f05b28ad2687
	$.ajax({
		type : "GET",
		//url : "../../js/custom/alarmjson.json", //测试json
		url: 'read_hitch_event',
		async : false,
		data : {},
		dataType: 'json',
		success : function(data) {
			statusReset = 1;
			var zTree = $.fn.zTree.getZTreeObj("treeDemo");
			for (var i = 0; i < data.length; i++) {
				console.log(i);
				
				if(data[i].id != null) {
					var nodeList = zTree.getNodesByParamFuzzy("id", data[i].id);
					console.log(nodeList);
					if(nodeList.length != 0) {
						if (data[i].open == true) {
							alert("警告，已经跳闸！");					
							update(nodeList, 2);  // 树节点变红
							worning_switchs_draw(nodeList[0]); //声音的 图标的
						} else {
							close_switchs_draw(nodeList[0]);
						}
					}
				}
			}
		}

	});

	alarmTimer = setTimeout(function() {
		hitchEventSpy();
	}, 8 * 1000);

}



/**
 * 
 * @Title: green_or_red
 * @Description: TODO
 * @param
 * @param sign
 * @param
 * @returns {String}
 * @return String
 * @throws
 */
function green_or_red(sign) {

	if (sign == "00") {

		return "green_point";
	} else if (sign == "01") {

		return "red_point";
	}

}

/**
 * 
 * @Title: worning_switchs_draw
 * @Description: TODO
 * @param
 * @param node
 * @return void
 * @throws
 */
function worning_switchs_draw(node) {

  console.log(node);

  old_icon = myIcon;// 保存原来的icon
   // 创建标注
  var pt = new BMap.Point(node.longitude, node.latitude);
  var myIcon = new BMap.Icon(worning_switch, new BMap.Size(40, 40));
  var marker2 = new BMap.Marker(pt, {
   icon : myIcon
  }); // 创建标注
  map.addOverlay(marker2); // 将标注添加到地图中,覆盖原有的图标
  map.panTo(pt);  // 将报警地点移到地图中间
  map.zoomTo(map.getZoom() + 5);

  // 不用添加文字提示
  // 需要重复添加点击事件

	$("body").append( "<audio src='../../audio/wornning.wav' autoplay='true' loop=true></audio>");

  marker2.addEventListener("click", function (e) {
    map.removeOverlay(marker2); // remove the alarm icon
    $('audio').remove(); // remove the audio
    handleAlarm(node); // pop up a handle window
  });
}

function close_switchs_draw(node) {  // 把在线的，合闸的点改为特定的图标
	
	/*var pt = new BMap.Point(node.longitude, node.latitude);
	var myIcon = new BMap.Icon(close_switch, new BMap.Size(20, 20));
	var marker2 = new BMap.Marker(pt, {
		icon : myIcon
	}); // 创建标注
	map.addOverlay(marker2); // 将标注添加到地图中,覆盖原有的图标
*/	
	switchs_draw(node, close_switch, click_high_voltage_switch);
}

/*
 * 处理报警事件
 *
 */

function handleAlarm (node) {
  $('#alarm_modal').modal('show');
  var now = new Date();
  var month = (now.getMonth() + 1);               
  var day = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  if(month < 10) 
    month = "0" + month;
  if(day < 10) 
    day = "0" + day;
  if(hour < 10)
    hour = "0" + hour;
  if(minute < 10)
    minute = "0" + minute;
  if(second < 10)
    second = "0" + second;
  var today = now.getFullYear() + '-' + month + '-' + day + ' ' 
            + hour + ':' + minute + ':' + second;
  $('#handleTime').val(today);
  $('#hiddenSwitchId').val(node.id);
}

function submitAlarmEvent () {
  var solvePeople = $('#handleName').val(),
      solveTime = $('#handleTime').val(),
      switchId = $('#hiddenSwitchId').val();

  $.ajax({
    type: 'POST',
    url: 'update_hitchEvent',
    async: false,
    dataType: 'json',
    data: {
      switchId: switchId,
      solveTime: solveTime,
      solvePeople: solvePeople
    },
    success: function (data) {
      if (data.success) {
        $('#alarm_modal').modal('hide');
      }
    }
  });

}

// //**************************************************************************
// //添加自定义控件
// //**************************************************************************
// //定义一个控件类,即function
// function ZoomControl() {
// // 默认停靠位置和偏移量
// this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
// this.defaultOffset = new BMap.Size(10, 10);
// }
//
// //通过JavaScript的prototype属性继承于BMap.Control
// ZoomControl.prototype = new BMap.Control();
//
// //自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
// //在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
// ZoomControl.prototype.initialize = function(map) {
// // 创建一个DOM元素
// var div = document.createElement("div");
// // 添加文字说明
// div.appendChild(document.createTextNode("添加连线"));
// // div.appendChild(document.createTextNode("编辑连线"));
// // div.appendChild(document.createTextNode("保存连线"));
// // 设置样式
// div.style.cursor = "pointer";
// div.style.border = "1px solid gray";
// div.style.backgroundColor = "white";
// // 绑定事件
// div.onclick = function(e) {
//
// var polyline = new BMap.Polyline([ new BMap.Point(116.500, 39.910),
// new BMap.Point(116.405, 39.900) ], {
// strokeColor : "blue",
// strokeWeight : 4,
// strokeOpacity : 0.5
// }); // 创建折线
//
// map.addOverlay(polyline);// 增加折线
// polyline.enableEditing();// 开启可编辑
// }
// // 添加DOM元素到地图中
// map.getContainer().appendChild(div);
// // 将DOM元素返回
// return div;
// }
// //创建控件
// var myZoomCtrl = new ZoomControl();
// //添加到地图当中
// map.addControl(myZoomCtrl);

