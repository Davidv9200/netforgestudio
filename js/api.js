/* NetForge Studio - Projects REST API Client */

class ProjectsAPI {
  constructor() {
    this.baseUrl = '/api/projects';
  }

  async getProjects() {
    try {
      const res = await fetch(this.baseUrl);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.projects || [];
    } catch (e) {
      console.warn('API getProjects failed:', e.message);
      return null; // Fallback indicator
    }
  }

  async getProject(id) {
    try {
      const res = await fetch(`${this.baseUrl}/${id}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.project || null;
    } catch (e) {
      console.error(`API getProject(${id}) failed:`, e.message);
      return null;
    }
  }

  async saveProject(id, name, topology) {
    try {
      const res = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, topology })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.project || null;
    } catch (e) {
      console.error('API saveProject failed:', e.message);
      return null;
    }
  }

  async deleteProject(id) {
    try {
      const res = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return true;
    } catch (e) {
      console.error(`API deleteProject(${id}) failed:`, e.message);
      return false;
    }
  }
}

window.projectsAPI = new ProjectsAPI();
export default window.projectsAPI;
