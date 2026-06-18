export type DashboardView = "admin" | "wz-regular" | "wz-special";
export type AccessRole = "admin" | "user" | "security";

export type DashboardViewConfig = {
  id: DashboardView;
  label: string;
  allowedRoles: AccessRole[];
};

export const DASHBOARD_VIEWS: DashboardViewConfig[] = [
  {
    id: "admin",
    label: "Panel administratora",
    allowedRoles: ["admin"],
  },
  {
    id: "wz-regular",
    label: "WZ Regular",
    allowedRoles: ["admin", "user"],
  },
  {
    id: "wz-special",
    label: "WZ Special",
    allowedRoles: ["admin", "security"],
  },
];
