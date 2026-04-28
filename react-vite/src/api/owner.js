import { call } from "./core";

export async function getOwnerGyms() {
  return call("/gyms/my", "GET");
}

export async function createOwnerGym(dto) {
  return call("/gyms", "POST", dto);
}


export async function createOwnerGymLockerZones(dto) {
<<<<<<< HEAD
  return call("/owners/lockers/zones", "POST", dto);
=======
  return call("/lockers/zones", "POST", dto);
>>>>>>> origin/main
}

export async function getOwnerGymMap(pathVariable) {
  return call("/gyms/{gymId}/map", "GET", null, pathVariable);
}

export async function saveOwnerGymMap(dto, pathVariable) {
  return call("/gyms/{gymId}/map", "POST", dto, pathVariable);
}

export async function finalizeOwnerGym(pathVariable) {
  return call("/gyms/{gymId}/finalize", "PATCH", null, pathVariable);
}

export async function getEquipmentIcons() {
  return call("/equipment-icons", "GET");
}

export async function getDraftOwnerGym() {
  return call("/gyms/draft", "GET");
}

export async function cancelOwnerGymDraft(pathVariable) {
  return call("/gyms/{gymId}/cancel", "PATCH", null, pathVariable);
}

export async function getOwnerGymEquipments(pathVariable) {
  return call("/gyms/{gymId}/equipments/manage", "GET", null, pathVariable);
}

export async function getOwnerGym(pathVariable) {
  return call("/gyms/{gymId}", "GET", null, pathVariable);
}

export async function updateOwnerGym(dto, pathVariable) {
  return call("/gyms/{gymId}", "PATCH", dto, pathVariable);
}

export async function getOwnerGymLockerZones(pathVariable) {
<<<<<<< HEAD
  return call("/owners/lockers/zones", "GET", pathVariable);
}

export async function updateOwnerGymLockerZone(dto, pathVariable) {
  return call("/owners/lockers/zones/{zoneId}", "PATCH", dto, pathVariable);
}

export async function deleteOwnerGymLockerZone(pathVariable) {
  return call("/owners/lockers/zones/{zoneId}", "DELETE", null, pathVariable);
=======
  return call("/lockers/zones/manage", "GET", pathVariable);
}

export async function updateOwnerGymLockerZone(dto, pathVariable) {
  return call("/lockers/zones/{zoneId}", "PATCH", dto, pathVariable);
}

export async function deleteOwnerGymLockerZone(pathVariable) {
  return call("/lockers/zones/{zoneId}", "DELETE", null, pathVariable);
>>>>>>> origin/main
}

export async function getOwnerGymStats(pathVariable) {
  return call("/gyms/{gymId}/stats", "GET", null, pathVariable);
}

export async function updateOwnerGymEquipmentStatus(dto, pathVariable) {
  return call("/equipments/{equipmentId}/status", "PATCH", dto, pathVariable);
}
<<<<<<< HEAD

export async function getGymMembers(pathVariable) {
  return call("/memberships/gyms/{gymId}/members", "GET", null, pathVariable);
}

export async function deleteGymMember(pathVariable) {
  return call("/memberships/gyms/{gymId}/members/{memberId}", "DELETE", null, pathVariable);
}
=======
>>>>>>> origin/main
