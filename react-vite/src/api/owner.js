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
