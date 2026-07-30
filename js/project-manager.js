/* NetForge Studio - Saved Projects Manager UI Controller */

import './api.js';

class ProjectManager {
  constructor() {
    this.currentProjectId = localStorage.getItem('netforge_active_project_id') || 'project_default';
    this.currentProjectName = localStorage.getItem('netforge_active_project_name') || 'Default Topology';
    
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.modal = document.getElementById('modal-projects');
    this.btnOpenModal = document.getElementById('btn-projects-menu');
    this.btnCloseModal = document.getElementById('btn-close-projects');
    this.projectsListContainer = document.getElementById('projects-grid-list');
    
    this.btnSaveCurrent = document.getElementById('btn-save-cloud-project');
    this.inputProjectName = document.getElementById('input-project-name');
    this.activeProjectNameLabel = document.getElementById('active-project-title-label');
    
    this.updateActiveProjectLabel();
  }

  bindEvents() {
    if (this.btnOpenModal) {
      this.btnOpenModal.addEventListener('click', () => this.openModal());
    }

    if (this.btnCloseModal) {
      this.btnCloseModal.addEventListener('click', () => this.closeModal());
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }

    if (this.btnSaveCurrent) {
      this.btnSaveCurrent.addEventListener('click', () => this.saveCurrentProject());
    }

    // Auto-save active project state changes
    window.addEventListener('state-changed', () => {
      this.debouncedAutoSave();
    });
  }

  updateActiveProjectLabel() {
    if (this.activeProjectNameLabel) {
      this.activeProjectNameLabel.textContent = this.currentProjectName;
    }
  }

  async openModal() {
    if (!this.modal) return;
    this.modal.classList.remove('hidden');
    if (this.inputProjectName) {
      this.inputProjectName.value = this.currentProjectName;
    }
    await this.renderProjectsList();
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }

  async renderProjectsList() {
    if (!this.projectsListContainer) return;

    this.projectsListContainer.innerHTML = `
      <div class="projects-loading">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
          <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12"/>
        </svg>
        <span>Loading saved cloud projects...</span>
      </div>
    `;

    const projects = await window.projectsAPI.getProjects();

    if (!projects) {
      this.projectsListContainer.innerHTML = `
        <div class="projects-empty-state">
          <p>⚠️ Standalone mode (Local Storage active). Connect to backend server to list cloud projects.</p>
        </div>
      `;
      return;
    }

    if (projects.length === 0) {
      this.projectsListContainer.innerHTML = `
        <div class="projects-empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          <p>No saved cloud projects yet. Type a project name above and click "Save Current Diagram".</p>
        </div>
      `;
      return;
    }

    let html = '';
    projects.forEach(p => {
      const isActive = p.id === this.currentProjectId;
      const formattedDate = new Date(p.updatedAt).toLocaleString();

      html += `
        <div class="project-card ${isActive ? 'active-card' : ''}" data-id="${p.id}">
          <div class="project-card-header">
            <h4 class="project-card-title">${this.escapeHtml(p.name)}</h4>
            ${isActive ? '<span class="active-badge">Active</span>' : ''}
          </div>

          <div class="project-card-meta">
            <span>💻 ${p.nodeCount || 0} Devices</span>
            <span>🔌 ${p.cableCount || 0} Cables</span>
            <span>🏢 ${p.siteCount || 1} Sites</span>
          </div>

          <div class="project-card-date">Modified: ${formattedDate}</div>

          <div class="project-card-actions">
            <button class="btn primary btn-sm btn-load-project" data-id="${p.id}">Open</button>
            <button class="btn secondary btn-sm btn-dup-project" data-id="${p.id}" title="Duplicate Project">Copy</button>
            <button class="btn danger btn-sm btn-delete-project" data-id="${p.id}" title="Delete Project">🗑️</button>
          </div>
        </div>
      `;
    });

    this.projectsListContainer.innerHTML = html;

    // Attach card event listeners
    this.projectsListContainer.querySelectorAll('.btn-load-project').forEach(btn => {
      btn.addEventListener('click', (e) => this.loadProject(e.target.dataset.id));
    });

    this.projectsListContainer.querySelectorAll('.btn-dup-project').forEach(btn => {
      btn.addEventListener('click', (e) => this.duplicateProject(e.target.dataset.id));
    });

    this.projectsListContainer.querySelectorAll('.btn-delete-project').forEach(btn => {
      btn.addEventListener('click', (e) => this.deleteProject(e.target.dataset.id));
    });
  }

  async saveCurrentProject() {
    const name = this.inputProjectName ? this.inputProjectName.value.trim() : 'Untitled Topology';
    if (!name) return;

    this.currentProjectName = name;
    localStorage.setItem('netforge_active_project_name', this.currentProjectName);

    const topology = {
      nodes: window.appState.nodes,
      cables: window.appState.cables,
      availableSites: window.appState.availableSites,
      siteRegions: window.appState.siteRegions
    };

    const saved = await window.projectsAPI.saveProject(this.currentProjectId, this.currentProjectName, topology);
    if (saved) {
      this.currentProjectId = saved.id;
      localStorage.setItem('netforge_active_project_id', this.currentProjectId);
      this.updateActiveProjectLabel();
      await this.renderProjectsList();
      this.showToast('✅ Project saved to server!');
    }
  }

  async loadProject(id) {
    const data = await window.projectsAPI.getProject(id);
    if (data) {
      this.currentProjectId = data.id;
      this.currentProjectName = data.name || 'Untitled Topology';
      
      localStorage.setItem('netforge_active_project_id', this.currentProjectId);
      localStorage.setItem('netforge_active_project_name', this.currentProjectName);

      window.appState.loadTopology({
        nodes: data.nodes || [],
        cables: data.cables || [],
        availableSites: data.availableSites || [],
        siteRegions: data.siteRegions || {}
      });

      this.updateActiveProjectLabel();
      this.closeModal();
      this.showToast(`📂 Loaded "${this.currentProjectName}"`);
    }
  }

  async duplicateProject(id) {
    const sourceData = await window.projectsAPI.getProject(id);
    if (sourceData) {
      const newId = 'project_' + Date.now();
      const newName = `${sourceData.name || 'Project'} (Copy)`;
      await window.projectsAPI.saveProject(newId, newName, sourceData);
      await this.renderProjectsList();
      this.showToast('📋 Project duplicated!');
    }
  }

  async deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    const deleted = await window.projectsAPI.deleteProject(id);
    if (deleted) {
      if (id === this.currentProjectId) {
        this.currentProjectId = 'project_' + Date.now();
        this.currentProjectName = 'Default Topology';
        localStorage.setItem('netforge_active_project_id', this.currentProjectId);
        localStorage.setItem('netforge_active_project_name', this.currentProjectName);
        this.updateActiveProjectLabel();
      }
      await this.renderProjectsList();
      this.showToast('🗑️ Project deleted');
    }
  }

  debouncedAutoSave() {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      this.autoSave();
    }, 5000);
  }

  async autoSave() {
    if (!this.currentProjectId) return;
    const topology = {
      nodes: window.appState.nodes,
      cables: window.appState.cables,
      availableSites: window.appState.availableSites,
      siteRegions: window.appState.siteRegions
    };
    await window.projectsAPI.saveProject(this.currentProjectId, this.currentProjectName, topology);
  }

  showToast(msg) {
    const banner = document.getElementById('wiring-banner');
    if (banner) {
      const originalText = banner.innerHTML;
      banner.innerHTML = `<span>${msg}</span>`;
      banner.classList.remove('hidden');
      setTimeout(() => {
        banner.classList.add('hidden');
        banner.innerHTML = originalText;
      }, 2500);
    }
  }

  escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.projectManager = new ProjectManager();
});
