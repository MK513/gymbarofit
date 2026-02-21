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
