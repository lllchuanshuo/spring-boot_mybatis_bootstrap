package com.gdut.dongjun.domain.po.port;

public class ProtocolPort {
    /**
     * This field was generated by MyBatis Generator.
     * This field corresponds to the database column protocol_port.id
     *
     * @mbggenerated Thu Jan 28 17:08:16 CST 2016
     */
    private String id;

    /**
     * This field was generated by MyBatis Generator.
     * This field corresponds to the database column protocol_port.lv_port
     *
     * @mbggenerated Thu Jan 28 17:08:16 CST 2016
     */
    private Integer lvPort;

    /**
     * This field was generated by MyBatis Generator.
     * This field corresponds to the database column protocol_port.hv_port
     *
     * @mbggenerated Thu Jan 28 17:08:16 CST 2016
     */
    private Integer hvPort;

    /**
     * This field was generated by MyBatis Generator.
     * This field corresponds to the database column protocol_port.con_port
     *
     * @mbggenerated Thu Jan 28 17:08:16 CST 2016
     */
    private Integer conPort;

    /**
     * This method was generated by MyBatis Generator.
     * This method returns the value of the database column protocol_port.id
     *
     * @return the value of protocol_port.id
     *
     * @mbggenerated Thu Jan 28 17:08:16 CST 2016
     */
    public String getId() {
        return id;
    }

    /**
     * This method was generated by MyBatis Generator.
     * This method sets the value of the database column protocol_port.id
     *
     * @param id the value for protocol_port.id
     *
     * @mbggenerated Thu Jan 28 17:08:16 CST 2016
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * This method was generated by MyBatis Generator.
     * This method returns the value of the database column protocol_port.lv_port
     *
     * @return the value of protocol_port.lv_port
     *
     * @mbggenerated Thu Jan 28 17:08:16 CST 2016
     */
    public Integer getLvPort() {
        return lvPort;
    }

    /**
     * This method was generated by MyBatis Generator.
     * This method sets the value of the database column protocol_port.lv_port
     *
     * @param lvPort the value for protocol_port.lv_port
     *
     * @mbggenerated Thu Jan 28 17:08:16 CST 2016
     */
    public void setLvPort(Integer lvPort) {
        this.lvPort = lvPort;
    }

    /**
     * This method was generated by MyBatis Generator.
     * This method returns the value of the database column protocol_port.hv_port
     *
     * @return the value of protocol_port.hv_port
     *
     * @mbggenerated Thu Jan 28 17:08:16 CST 2016
     */
    public Integer getHvPort() {
        return hvPort;
    }

    /**
     * This method was generated by MyBatis Generator.
     * This method sets the value of the database column protocol_port.hv_port
     *
     * @param hvPort the value for protocol_port.hv_port
     *
     * @mbggenerated Thu Jan 28 17:08:16 CST 2016
     */
    public void setHvPort(Integer hvPort) {
        this.hvPort = hvPort;
    }

    /**
     * This method was generated by MyBatis Generator.
     * This method returns the value of the database column protocol_port.con_port
     *
     * @return the value of protocol_port.con_port
     *
     * @mbggenerated Thu Jan 28 17:08:16 CST 2016
     */
    public Integer getConPort() {
        return conPort;
    }

    /**
     * This method was generated by MyBatis Generator.
     * This method sets the value of the database column protocol_port.con_port
     *
     * @param conPort the value for protocol_port.con_port
     *
     * @mbggenerated Thu Jan 28 17:08:16 CST 2016
     */
    public void setConPort(Integer conPort) {
        this.conPort = conPort;
    }
}