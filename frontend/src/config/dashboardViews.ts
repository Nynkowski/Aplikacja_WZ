export type DashboardView =
  | "admin"
  | "wz-regular"
  | "wz-special"
  | "history"
  | "potwierdzenie-ochrona";

export type AccessRole = "admin" | "user" | "security";

export type DashboardViewConfig = {
  id: DashboardView;
  path: DashboardView;
  label: string;
  allowedRoles: AccessRole[];
};

export const DASHBOARD_VIEWS: DashboardViewConfig[] = [
  {
    id: "wz-regular",
    path: "wz-regular",
    label: "WZ Regular",
    allowedRoles: ["admin", "user"],
  },
  {
    id: "wz-special",
    path: "wz-special",
    label: "WZ Special",
    allowedRoles: ["admin", "security"],
  },
  {
    id: "history",
    path: "history",
    label: "Historia",
    allowedRoles: ["admin", "user"],
  },
  {
    id: "potwierdzenie-ochrona",
    path: "potwierdzenie-ochrona",
    label: "Potwierdzenie Ochrona",
    allowedRoles: ["admin", "security"],
  },
  {
    id: "admin",
    path: "admin",
    label: "Panel administratora",
    allowedRoles: ["admin"],
  },
];

export function normalizeAccessRole(role: string): AccessRole | null {
  const normalizedRole = role.trim().toLowerCase();

  if (
    normalizedRole === "admin" ||
    normalizedRole === "user" ||
    normalizedRole === "security"
  ) {
    return normalizedRole;
  }

  return null;
}

export function hasRoleAccess(
  allowedRoles: AccessRole[],
  role: string,
): boolean {
  const normalizedRole = normalizeAccessRole(role);

  if (!normalizedRole) {
    return false;
  }

  return allowedRoles.includes(normalizedRole);
}

export function getAvailableViewsForRole(role: string): DashboardViewConfig[] {
  return DASHBOARD_VIEWS.filter((view) =>
    hasRoleAccess(view.allowedRoles, role),
  );
}

export function getDefaultViewForRole(
  role: string,
): DashboardViewConfig | null {
  const views = getAvailableViewsForRole(role);

  return views[0] ?? null;
}
