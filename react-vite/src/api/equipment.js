import { call } from "./core";

export async function createUsage(pathVariable) {
  return call("/equipments/{equipmentId}/usages", "POST", null, pathVariable);
}

export async function createQueue(pathVariable) {
  return call("/equipments/{equipmentId}/usages/wait", "POST", null, pathVariable);
}

export async function startUsage(pathVariable) {
  return call("/equipments/usages/{usageId}/start", "POST", null, pathVariable);
}

export async function endUsage(pathVariable) {
  return call("/equipments/usages/{usageId}/end", "POST", null, pathVariable);
}

export async function leaveQueue(pathVariable) {
  return call("/equipments/usages/{usageId}/cancel", "POST", null, pathVariable);
}

export async function createOwnerGymEquipments(dto, pathVariable) {
  return call("/equipments/{gymId}", "POST", dto, pathVariable);
}

export async function updateOwnerGymEquipment(dto, pathVariable) {
  return call("/equipments/{equipmentId}", "PATCH", dto, pathVariable);
}

export async function deleteOwnerGymEquipment(pathVariable) {
  return call("/equipments/{equipmentId}", "DELETE", null, pathVariable);
}
