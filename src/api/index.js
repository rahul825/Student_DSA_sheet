import { request } from "./client";
import { tzOffset } from "../utils/date";

export const authApi = {
  login: (credentials) => request("/auth/login", { method: "POST", body: credentials }),
  register: (data) => request("/auth/register", { method: "POST", body: data }),
  me: () => request("/auth/me"),
};

export const sheetApi = {
  get: () => request("/sheet"),
};

export const progressApi = {
  update: (problemId, patch) => request(`/progress/${problemId}`, { method: "PUT", body: patch }),
  summary: () => request("/progress/summary", { params: { tz: tzOffset() } }),
};

export const plansApi = {
  list: (from, to) => request("/plans", { params: { from, to, tz: tzOffset() } }),
  create: (plan) => request("/plans", { method: "POST", body: plan }),
  update: (id, patch) => request(`/plans/${id}`, { method: "PATCH", body: patch }),
  remove: (id) => request(`/plans/${id}`, { method: "DELETE" }),
  autoPlan: (options) => request("/plans/auto", { method: "POST", body: options }),
};
