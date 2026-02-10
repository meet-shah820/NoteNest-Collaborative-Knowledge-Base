const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface AuditLog {
  _id: string;
  action: string;
  actor: {
    _id: string;
    name: string;
    email: string;
  };
  workspaceId: string;
  target: string;
  targetType: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: { userId: string; role: 'admin' | 'editor' | 'viewer' }[];
  createdAt: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  workspaceId: string;
  author: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Permission denied');
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  // Workspaces
  async getWorkspacesForUser(userId: string): Promise<Workspace[]> {
    return this.request(`/api/workspaces/user/${userId}`);
  }

  async createWorkspace(name: string, description: string, ownerId: string): Promise<Workspace> {
    return this.request('/api/workspaces', {
      method: 'POST',
      body: JSON.stringify({ name, description, ownerId }),
    });
  }

  async addMemberToWorkspace(workspaceId: string, userId: string, role: string, addedBy: string): Promise<Workspace> {
    return this.request(`/api/workspaces/${workspaceId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role, addedBy }),
    });
  }

  async removeMemberFromWorkspace(workspaceId: string, userId: string): Promise<Workspace> {
    return this.request(`/api/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  async updateMemberRole(workspaceId: string, userId: string, role: string): Promise<Workspace> {
    return this.request(`/api/workspaces/${workspaceId}/members/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async getAuditLogs(workspaceId: string, limit = 50, skip = 0): Promise<AuditLog[]> {
    return this.request(`/api/workspaces/${workspaceId}/audit-logs?limit=${limit}&skip=${skip}`);
  }

  // Notes
  async getNotesForWorkspace(workspaceId: string): Promise<Note[]> {
    return this.request(`/api/notes/workspace/${workspaceId}`);
  }

  async createNote(title: string, content: string, workspaceId: string, authorId: string): Promise<Note> {
    return this.request('/api/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content, workspaceId, authorId }),
    });
  }

  async updateNote(id: string, title: string, content: string, authorId: string): Promise<Note> {
    return this.request(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content, authorId }),
    });
  }

  async deleteNote(id: string, authorId: string): Promise<void> {
    return this.request(`/api/notes/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ authorId }),
    });
  }

  // Users
  async register(email: string, password: string, name: string): Promise<{ userId: string; message: string }> {
    return this.request('/api/users/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return this.request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getUser(id: string): Promise<User> {
    return this.request(`/api/users/${id}`);
  }
}

export const apiService = new ApiService();
