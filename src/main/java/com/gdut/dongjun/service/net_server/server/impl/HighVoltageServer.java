package com.gdut.dongjun.service.net_server.server.impl;

import java.util.List;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gdut.dongjun.domain.po.HighVoltageSwitch;
import com.gdut.dongjun.domain.po.LowVoltageSwitch;
import com.gdut.dongjun.service.HighVoltageSwitchService;
import com.gdut.dongjun.service.impl.enums.HighCommandControlCode;
import com.gdut.dongjun.service.net_server.CtxStore;
import com.gdut.dongjun.service.net_server.SwitchGPRS;
import com.gdut.dongjun.service.net_server.initializer.ServerInitializer;
import com.gdut.dongjun.service.net_server.server.NetServer;
import com.gdut.dongjun.util.HighVoltageDeviceCommandUtil;
import com.gdut.dongjun.util.LowVoltageDeviceCommandUtil;
import com.sun.xml.internal.bind.v2.TODO;

/**
 * @author Sherlock-lee
 * @date 2015年11月17日 下午12:01:03
 * @see TODO
 * @since 1.0
 */
@Service("HighVoltageServer")
public class HighVoltageServer extends NetServer {

	@Resource(name = "HighVoltageServerInitializer")
	private ServerInitializer initializer;
	@Autowired
	private HighVoltageSwitchService lowVoltageSwitchService;
	private static final Logger logger = Logger.getLogger(HighVoltageServer.class);

	@Resource(name = "HighVoltageServerInitializer")
	public void setInitializer(ServerInitializer initializer) {

		super.initializer = initializer;
		super.cvReadBreak = 30 * 1000;//设置较短的读取间隔
	}

	@Override
	protected void hitchEventSpy() {

	}

	@Override
	protected void timedCVReadTask() {

		String msg = null;
		List<HighVoltageSwitch> switchs = lowVoltageSwitchService
				.selectByParameters(null);

		if (switchs != null) {
			for (HighVoltageSwitch s : switchs) {

				if (s.getId() != null && CtxStore.isReady(s.getId())) {

					SwitchGPRS gprs = CtxStore.get(s.getId());
					
					msg = new HighVoltageDeviceCommandUtil()
							.readVoltageAndCurrent(s.getAddress(),
									HighCommandControlCode.READ_VOLTAGE_CURRENT
											.toString());

					logger.info("读取 "+ s.getAddress()+" 的电流电压");
					gprs.getCtx().writeAndFlush(msg);// 读取电压
				}
			}
		}
	}

}
