import { call } from "./core";

export async function getLockerZone(dto) {
  return call("/lockers/zones", "GET", dto);
}

export async function getLockerList(pathVariable) {
  return call("/lockers/zones/{zoneId}", "GET", null, pathVariable);
}

export async function getLockerInfo(pathVariable) {
  return call("/lockers/usages/{usageId}", "GET", null, pathVariable);
}

export async function rentLocker(dto) {
  return call("/lockers/usages", "POST", dto);
}

export async function refundLocker(pathVariable) {
  return call("/lockers/usages/{usageId}", "DELETE", null, pathVariable);
}

export async function extendLocker(dto, pathVariable) {
  return call("/lockers/usages/{usageId}/extend", "POST", dto, pathVariable);
}
