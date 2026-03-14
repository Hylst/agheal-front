// src/integrations/api/client.ts
// Client API pour le backend PHP local (remplace Supabase)

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8081/agheal-api/public";

export interface ApiResponse<T = any> {
  data?: T;
  error?: { message: string };
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("access_token");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("access_token");
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem("access_token");
  }

  private async request<T>(
    endpoint: string,
    method: string = "GET",
    body?: any,
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
      });

      const json = await response.json();

      if (!response.ok) {
        return {
          error: { message: json.error || json.message || "Erreur serveur" },
        };
      }

      return { data: json };
    } catch (err: any) {
      return { error: { message: err.message || "Erreur réseau" } };
    }
  }

  // ─── Auth ───────────────────────────────────────────────────────────────
  async login(email: string, password: string) {
    const res = await this.request<{ access_token: string; user: any }>(
      "/auth/login",
      "POST",
      { email, password },
    );
    if (res.data?.access_token) {
      this.setToken(res.data.access_token);
    }
    return res;
  }

  async signup(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) {
    return this.request("/auth/signup", "POST", {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    });
  }

  async resetPassword(email: string) {
    return this.request("/auth/reset-password", "POST", { email });
  }

  // ─── Profile ─────────────────────────────────────────────────────────────
  async getMyProfile() {
    return this.request<{ user: any }>("/profiles/me");
  }

  async getProfile(userId: string) {
    return this.request<{ user: any }>(`/profiles/${userId}`);
  }

  async updateProfile(userId: string, data: Record<string, any>) {
    return this.request<{ user: any }>(`/profiles/${userId}`, "PUT", data);
  }

  async updateMyNotifications(data: Record<string, boolean>) {
    return this.request<{ user: any }>(
      "/profiles/me/notifications",
      "PUT",
      data,
    );
  }

  // ─── Users & Roles (Admin) ───────────────────────────────────────────────
  async getUsers() {
    return this.request<{ users: any[] }>("/admin/users");
  }

  async toggleUserStatus(userId: string, status: "actif" | "bloque") {
    return this.request<{ user: any }>(`/admin/users/${userId}/status`, "PUT", {
      statut_compte: status,
    });
  }

  async addUserRole(userId: string, role: "admin" | "coach" | "adherent") {
    return this.request<{ user: any }>(`/admin/users/${userId}/roles`, "POST", {
      role,
    });
  }

  async removeUserRole(userId: string, role: "admin" | "coach" | "adherent") {
    return this.request<{ user: any }>(
      `/admin/users/${userId}/roles/${role}`,
      "DELETE",
    );
  }

  async getClients() {
    return this.request<{ clients: any[] }>("/clients");
  }

  async updateClient(userId: string, data: Record<string, any>) {
    return this.request<{ client: any }>(`/clients/${userId}`, "PUT", data);
  }

  async setClientGroups(
    userId: string,
    groupIds: number[],
    assignedBy: string,
  ) {
    return this.request<{ client: any }>(`/clients/${userId}/groups`, "PUT", {
      group_ids: groupIds,
      assigned_by: assignedBy,
    });
  }

  async getUserGroups(userId: string) {
    return this.request<{ groups: any[] }>(`/profiles/${userId}/groups`);
  }

  // ─── Sessions ────────────────────────────────────────────────────────────
  async getSessions(filters?: { status?: string; include?: string }) {
    const query = new URLSearchParams();
    if (filters?.status) query.append("status", filters.status);
    if (filters?.include) query.append("include", filters.include);
    const params = query.toString() ? `?${query.toString()}` : "";
    return this.request<{ sessions: any[] }>(`/sessions${params}`);
  }

  async getSession(id: number | string) {
    return this.request<{ session: any }>(`/sessions/${id}`);
  }

  async createSessions(data: Record<string, any> | Record<string, any>[]) {
    return this.request<{ sessions: any }>("/sessions", "POST", data);
  }

  // Alias pour la compatibilité avec le code existant si besoin
  async createSession(data: Record<string, any>) {
    return this.createSessions(data);
  }

  async updateSession(id: number | string, data: Record<string, any>) {
    return this.request<{ session: any }>(`/sessions/${id}`, "PUT", data);
  }

  async deleteSession(id: number | string) {
    return this.request<{ success: boolean }>(`/sessions/${id}`, "DELETE");
  }

  // ─── Communications ───────────────────────────────────────────────────────
  async getCommunicationsTargets() {
    return this.request<{ data: any[] }>("/communications");
  }

  async getMyCommunications() {
    return this.request<{ data: any[] }>("/communications/my");
  }

  async saveCommunication(data: Record<string, any>) {
    return this.request<{ data: any; message: string }>("/communications", "POST", data);
  }

  async updateCommunication(id: number | string, data: Record<string, any>) {
    return this.request<{ data: any; message: string }>(`/communications/${id}`, "PUT", data);
  }

  async deleteCommunication(id: number | string) {
    return this.request<{ message: string }>(`/communications/${id}`, "DELETE");
  }

  // ─── Email Campaigns ──────────────────────────────────────────────────────
  async getEmailCampaigns() {
    return this.request<{ data: any[] }>("/email-campaigns");
  }

  async createEmailCampaign(data: Record<string, any>) {
    return this.request<{ data: any; message: string }>("/email-campaigns", "POST", data);
  }

  async deleteEmailCampaign(id: number | string) {
    return this.request<{ message: string }>(`/email-campaigns/${id}`, "DELETE");
  }

  // ─── Registrations ───────────────────────────────────────────────────────
  async getMyRegistrations() {
    return this.request<{ registrations: any[] }>("/registrations/me");
  }

  async registerToSession(sessionId: number | string) {
    return this.request<{ registration: any }>("/registrations", "POST", {
      session_id: sessionId,
    });
  }

  async unregisterFromSession(sessionId: number | string) {
    return this.request<{ success: boolean }>(
      `/registrations/${sessionId}`,
      "DELETE",
    );
  }

  // ─── Session Types (Activities) ───────────────────────────────────────────
  async getSessionTypes() {
    return this.request<{ session_types: any[] }>("/session-types");
  }

  async createSessionType(data: Record<string, any>) {
    return this.request<{ session_type: any }>("/session-types", "POST", data);
  }

  async updateSessionType(id: number, data: Record<string, any>) {
    return this.request<{ session_type: any }>(
      `/session-types/${id}`,
      "PUT",
      data,
    );
  }

  async deleteSessionType(id: number) {
    return this.request<{ success: boolean }>(`/session-types/${id}`, "DELETE");
  }

  // ─── Locations ────────────────────────────────────────────────────────────
  async getLocations() {
    return this.request<{ locations: any[] }>("/locations");
  }

  async createLocation(data: Record<string, any>) {
    return this.request<{ location: any }>("/locations", "POST", data);
  }

  async updateLocation(id: number, data: Record<string, any>) {
    return this.request<{ location: any }>(`/locations/${id}`, "PUT", data);
  }

  async deleteLocation(id: number) {
    return this.request<{ success: boolean }>(`/locations/${id}`, "DELETE");
  }

  // ─── Groups ───────────────────────────────────────────────────────────────
  async getGroups() {
    return this.request<{ groups: any[] }>("/groups");
  }

  async createGroup(data: Record<string, any>) {
    return this.request<{ group: any }>("/groups", "POST", data);
  }

  async updateGroup(id: number, data: Record<string, any>) {
    return this.request<{ group: any }>(`/groups/${id}`, "PUT", data);
  }

  async deleteGroup(id: number) {
    return this.request<{ success: boolean }>(`/groups/${id}`, "DELETE");
  }

  // ─── Contact ──────────────────────────────────────────────────────────────
  async sendContact(data: { name: string; email: string; message: string }) {
    return this.request<{ success: boolean }>("/contact", "POST", data);
  }
}

export const apiClient = new ApiClient();
