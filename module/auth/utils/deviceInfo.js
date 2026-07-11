import { UAParser } from "ua-parser-js";

export const getDeviceInfo = (req) => {
  const parser = new UAParser();

  parser.setUA(req.headers["user-agent"] || "");

  const result = parser.getResult();

  return {
    browser: result.browser.name || "Unknown",

    platform: result.os.name || "Unknown",

    deviceName:
      result.device.model ||
      result.device.vendor ||
      (result.device.type ? result.device.type : "Desktop"),

    deviceId: null,

    userAgent: req.headers["user-agent"] || "",

    ip:
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket.remoteAddress ||
      "",
  };
};   