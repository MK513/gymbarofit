import { call } from "./core";

export async function getWorkoutHistory(dto) {
  return call("/members/history", "GET", dto);
}
