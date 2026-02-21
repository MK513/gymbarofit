import { call } from "./core";

export async function loginMember(dto) {
  return call("/members/login", "POST", dto);
}

export async function loginOwner(dto) {
  return call("/owners/login", "POST", dto);
}

export const signupMember = (dto) => call("/members/register", "POST", dto);

export const signupOwner = (dto) => call("/owners/register", "POST", dto);
