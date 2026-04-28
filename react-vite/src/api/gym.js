import { call } from "./core";

export async function getMembershipInfo(pathVariable) {
<<<<<<< HEAD
  return call("/memberships/gyms/{gymId}/info", "GET", null, pathVariable);
=======
  return call("/memberships/{gymId}/info", "GET", null, pathVariable);
>>>>>>> origin/main
}

export async function searchGym(dto) {
  return call("/gyms/search", "GET", dto);
}

export async function registerGym(pathVariable) {
  return call("/gyms/{gymId}/memberships", "POST", null, pathVariable);
}

export async function getEquipments(pathVariable) {
  return call("/gyms/{gymId}/equipments", "GET", null, pathVariable);
}

export async function checkIn(pathVariable) {
  return call("/gyms/{gymId}/checkin", "POST", null, pathVariable);
}

export async function checkOut(pathVariable) {
  return call("/gyms/{gymId}/checkout", "POST", null, pathVariable);
}
