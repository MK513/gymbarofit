import { call } from "./core";

export async function getOwnerGyms() {
  return call("/owners/gyms", "GET");
}

export async function createOwnerGym(dto) {
  return call("/owners/gyms", "POST", dto);
}

export async function createOwnerGymEquipments(dto, pathVariable) {
  return call("/owners/gyms/{gymId}/equipments", "POST", dto, pathVariable);
}

export async function createOwnerGymLockerZones(dto, pathVariable) {
  return call("/owners/gyms/{gymId}/locker-zones", "POST", dto, pathVariable);
}

export async function getOwnerGymMap(pathVariable) {
  return call("/owners/gyms/{gymId}/map", "GET", null, pathVariable);
}

export async function saveOwnerGymMap(dto, pathVariable) {
  return call("/owners/gyms/{gymId}/map", "POST", dto, pathVariable);
}

export async function finalizeOwnerGym(pathVariable) {
  return call("/owners/gyms/{gymId}/finalize", "PATCH", null, pathVariable);
}

export async function getEquipmentIcons() {
  return call("/equipment-icons", "GET");
}

export async function getDraftOwnerGym() {
  return call("/owners/gyms/draft", "GET");
}

export async function cancelOwnerGymDraft(pathVariable) {
  return call("/owners/gyms/{gymId}/cancel", "PATCH", null, pathVariable);
}

export async function getOwnerGymEquipments(pathVariable) {
  return call("/owners/gyms/{gymId}/equipments", "GET", null, pathVariable);
}

export async function getOwnerGym(pathVariable) {
  return call("/owners/gyms/{gymId}", "GET", null, pathVariable);
}

export async function updateOwnerGym(dto, pathVariable) {
  return call("/owners/gyms/{gymId}", "PATCH", dto, pathVariable);
}

export async function getOwnerGymLockerZones(pathVariable) {
  return call("/owners/gyms/{gymId}/locker-zones", "GET", null, pathVariable);
}

export async function updateOwnerGymLockerZone(dto, pathVariable) {
  return call("/owners/gyms/{gymId}/locker-zones/{zoneId}", "PATCH", dto, pathVariable);
}

export async function deleteOwnerGymLockerZone(pathVariable) {
  return call("/owners/gyms/{gymId}/locker-zones/{zoneId}", "DELETE", null, pathVariable);
}

export async function updateOwnerGymEquipment(dto, pathVariable) {
  return call("/owners/gyms/{gymId}/equipments/{equipmentId}", "PATCH", dto, pathVariable);
}

export async function deleteOwnerGymEquipment(pathVariable) {
  return call("/owners/gyms/{gymId}/equipments/{equipmentId}", "DELETE", null, pathVariable);
}

export async function getOwnerGymStats(pathVariable) {
  return call("/owners/gyms/{gymId}/stats", "GET", null, pathVariable);
}

export async function updateOwnerGymEquipmentStatus(dto, pathVariable) {
  return call("/equipments/{equipmentId}/status", "PATCH", dto, pathVariable);
}
