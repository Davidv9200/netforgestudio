/* NetForge Studio - Main Application Dispatcher & Entry Point */

document.addEventListener('DOMContentLoaded', () => {

  // Initialize Canvas, Inspector, and Simulator
  window.initCanvas();
  window.initInspector();
  window.initSimulator();

  // Load saved state from LocalStorage if available, otherwise initialize a blank canvas
  const restored = window.appState.loadFromLocalStorage();
  if (!restored) {
    window.appState.loadTopology({ nodes: [], cables: [], zones: [] });
  }

  // Wire toolbar action buttons
  document.getElementById('btn-new').addEventListener('click', () => {
    if (confirm('Clear current topology workspace?')) {
      window.appState.loadTopology({ nodes: [], cables: [], zones: [] });
    }
  });

  document.getElementById('btn-undo').addEventListener('click', () => window.appState.undo());
  document.getElementById('btn-redo').addEventListener('click', () => window.appState.redo());

  // Cable Wire Mode toggle button
  const cableBtn = document.getElementById('btn-cable-mode');
  cableBtn.addEventListener('click', () => {
    window.appState.wiringMode = !window.appState.wiringMode;
    if (window.appState.wiringMode) {
      cableBtn.classList.add('active');
      document.getElementById('wiring-banner').classList.remove('hidden');
    } else {
      cableBtn.classList.remove('active');
      window.canvasController.cancelWiringMode();
    }
  });

  // Cable select options
  document.getElementById('select-cable-type').addEventListener('change', (e) => {
    window.appState.wiringCableType = e.target.value;
  });

  document.getElementById('select-cable-style').addEventListener('change', (e) => {
    window.appState.wiringCableStyle = e.target.value;
  });

  // Snap to Grid toggle
  const snapBtn = document.getElementById('btn-snap-grid');
  snapBtn.addEventListener('click', () => {
    window.appState.snapToGrid = !window.appState.snapToGrid;
    snapBtn.classList.toggle('active', window.appState.snapToGrid);
  });

  // Zoom controls
  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    window.appState.zoomLevel = Math.min(2.5, window.appState.zoomLevel + 0.15);
    window.canvasController.applyTransform();
    document.getElementById('zoom-level-text').textContent = `${Math.round(window.appState.zoomLevel * 100)}%`;
  });

  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    window.appState.zoomLevel = Math.max(0.4, window.appState.zoomLevel - 0.15);
    window.canvasController.applyTransform();
    document.getElementById('zoom-level-text').textContent = `${Math.round(window.appState.zoomLevel * 100)}%`;
  });

  document.getElementById('btn-zoom-reset').addEventListener('click', () => {
    window.appState.zoomLevel = 1.0;
    window.appState.panX = 0;
    window.appState.panY = 0;
    window.canvasController.applyTransform();
    document.getElementById('zoom-level-text').textContent = '100%';
  });

  // Templates Modal
  const modalTemplates = document.getElementById('modal-templates');
  document.getElementById('btn-templates').addEventListener('click', () => {
    modalTemplates.classList.remove('hidden');
  });
  document.getElementById('btn-close-templates').addEventListener('click', () => {
    modalTemplates.classList.add('hidden');
  });

  document.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.getAttribute('data-template');
      window.TemplateRegistry.loadTemplate(key);
      modalTemplates.classList.add('hidden');
    });
  });

  // BOM / IP Table Modal
  const modalBom = document.getElementById('modal-bom');
  document.getElementById('btn-bom').addEventListener('click', () => {
    window.ExportManager.generateBomReport();
    modalBom.classList.remove('hidden');
  });
  document.getElementById('btn-close-bom').addEventListener('click', () => {
    modalBom.classList.add('hidden');
  });
  document.getElementById('btn-copy-bom').addEventListener('click', () => {
    const text = document.getElementById('table-bom-devices').innerText;
    navigator.clipboard.writeText(text).then(() => alert('Inventory table copied to clipboard!'));
  });

  // Save / Load / Export
  document.getElementById('btn-save-json').addEventListener('click', () => window.ExportManager.exportJson());

  const fileInput = document.getElementById('file-input-json');
  document.getElementById('btn-load-json').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      window.ExportManager.importJson(e.target.files[0]);
    }
  });

  document.getElementById('export-png').addEventListener('click', (e) => {
    e.preventDefault();
    window.ExportManager.exportPng();
  });

  document.getElementById('export-svg').addEventListener('click', (e) => {
    e.preventDefault();
    window.ExportManager.exportSvg();
  });

  // Search filter for component palette
  document.getElementById('library-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.palette-item').forEach(item => {
      const name = item.querySelector('.item-name').textContent.toLowerCase();
      const desc = item.querySelector('.item-desc').textContent.toLowerCase();
      if (name.includes(term) || desc.includes(term)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  });

  // Attach HTML5 dragstart data transfer to all palette items
  const libraryContainer = document.querySelector('.library-scroll');
  if (libraryContainer) {
    libraryContainer.addEventListener('dragstart', (e) => {
      const item = e.target.closest('.palette-item');
      if (item) {
        const type = item.getAttribute('data-type');
        if (type) {
          e.dataTransfer.setData('text/plain', type);
          e.dataTransfer.effectAllowed = 'copy';
        }
      }
    });

    // Also support click-to-add for quick device placement
    libraryContainer.addEventListener('click', (e) => {
      const item = e.target.closest('.palette-item');
      if (item) {
        const type = item.getAttribute('data-type');
        if (type) {
          const dropX = 300 + (Math.random() * 80 - 40);
          const dropY = 200 + (Math.random() * 80 - 40);
          if (type.startsWith('zone_')) {
            const siteName = type === 'zone_dmz' ? 'DMZ Security Zone' : 'VLAN 10 Subnet Zone';
            const siteColor = type === 'zone_dmz' ? '#ef4444' : '#3b82f6';
            window.appState.createSite(siteName, siteColor);
          } else {
            window.appState.addNode({
              type: type,
              x: dropX,
              y: dropY
            });
          }
        }
      }
    });
  }

  // Floating Alignment Bar Listener
  const alignBar = document.getElementById('alignment-bar');
  const alignCount = document.getElementById('align-count');
  const bulkSiteSelect = document.getElementById('select-bulk-site');

  function updateAlignmentBar() {
    const selCount = window.appState.selectedNodeIds ? window.appState.selectedNodeIds.length : 0;
    if (selCount > 1 && alignBar) {
      alignBar.classList.remove('hidden');
      alignCount.textContent = selCount;

      // Populate bulk site options
      bulkSiteSelect.innerHTML = '<option value="" disabled selected>Move to Site...</option>';
      window.appState.availableSites.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        bulkSiteSelect.appendChild(opt);
      });
    } else if (alignBar) {
      alignBar.classList.add('hidden');
    }
  }

  window.addEventListener('selection-changed', updateAlignmentBar);
  window.addEventListener('state-changed', updateAlignmentBar);

  document.getElementById('btn-align-left')?.addEventListener('click', () => window.appState.alignSelectedNodes('left'));
  document.getElementById('btn-align-center-h')?.addEventListener('click', () => window.appState.alignSelectedNodes('center-h'));
  document.getElementById('btn-align-right')?.addEventListener('click', () => window.appState.alignSelectedNodes('right'));
  document.getElementById('btn-align-top')?.addEventListener('click', () => window.appState.alignSelectedNodes('top'));
  document.getElementById('btn-align-center-v')?.addEventListener('click', () => window.appState.alignSelectedNodes('center-v'));
  document.getElementById('btn-align-bottom')?.addEventListener('click', () => window.appState.alignSelectedNodes('bottom'));

  bulkSiteSelect?.addEventListener('change', (e) => {
    window.appState.bulkAssignSite(e.target.value);
    e.target.selectedIndex = 0;
  });

  document.getElementById('btn-delete-selected')?.addEventListener('click', () => {
    if (confirm(`Delete all ${window.appState.selectedNodeIds.length} selected device nodes?`)) {
      const ids = [...window.appState.selectedNodeIds];
      ids.forEach(id => window.appState.removeNode(id));
      window.appState.clearMultiSelection();
    }
  });

  // Site Manager Modal
  const modalSiteManager = document.getElementById('modal-site-manager');
  const sitesTbody = document.getElementById('sites-tbody');

  function renderSiteManagerTable() {
    if (!sitesTbody) return;
    sitesTbody.innerHTML = '';

    window.appState.availableSites.forEach(siteName => {
      const region = window.appState.getSiteRegion(siteName);
      const assignedNodes = window.appState.nodes.filter(n => (n.site || 'Site A (HQ)') === siteName);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <input type="color" value="${region.color || '#0284c7'}" class="site-color-picker" data-site="${siteName}" style="width: 28px; height: 28px; border: none; background: transparent; cursor: pointer;">
        </td>
        <td>
          <input type="text" value="${siteName}" class="prop-input site-rename-input" data-site="${siteName}" style="width: 180px;">
        </td>
        <td><strong>${assignedNodes.length}</strong> ${assignedNodes.length === 1 ? 'Device' : 'Devices'}</td>
        <td>
          <button class="btn secondary btn-save-site-rename" data-site="${siteName}" style="padding: 4px 8px; font-size: 0.75rem;">Rename</button>
          <button class="btn secondary btn-delete-site danger" data-site="${siteName}" style="padding: 4px 8px; font-size: 0.75rem; color: #ef4444;">Delete</button>
        </td>
      `;
      sitesTbody.appendChild(tr);
    });

    // Wire table inner events
    sitesTbody.querySelectorAll('.site-color-picker').forEach(picker => {
      picker.addEventListener('change', (e) => {
        const site = e.target.getAttribute('data-site');
        window.appState.setSiteColor(site, e.target.value);
      });
    });

    sitesTbody.querySelectorAll('.btn-save-site-rename').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const oldName = e.target.getAttribute('data-site');
        const input = e.target.closest('tr').querySelector('.site-rename-input');
        const newName = input.value.trim();
        if (newName && newName !== oldName) {
          window.appState.renameSite(oldName, newName);
          renderSiteManagerTable();
        }
      });
    });

    sitesTbody.querySelectorAll('.btn-delete-site').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const site = e.target.getAttribute('data-site');
        if (confirm(`Delete site '${site}'? Devices will be reassigned to remaining sites.`)) {
          const success = window.appState.deleteSite(site);
          if (!success) {
            alert('Cannot delete the last remaining site region.');
          } else {
            renderSiteManagerTable();
          }
        }
      });
    });
  }

  document.getElementById('btn-site-manager')?.addEventListener('click', (e) => {
    e.preventDefault();
    renderSiteManagerTable();
    modalSiteManager.classList.remove('hidden');
  });

  document.getElementById('ctx-site-manager')?.addEventListener('click', (e) => {
    e.preventDefault();
    renderSiteManagerTable();
    modalSiteManager.classList.remove('hidden');
  });

  document.getElementById('close-site-manager')?.addEventListener('click', () => {
    modalSiteManager.classList.add('hidden');
  });

  document.getElementById('btn-done-site-manager')?.addEventListener('click', () => {
    modalSiteManager.classList.add('hidden');
  });

  document.getElementById('btn-add-site')?.addEventListener('click', () => {
    const nameInput = document.getElementById('input-new-site-name');
    const colorInput = document.getElementById('input-new-site-color');
    const name = nameInput.value.trim();
    if (name) {
      window.appState.createSite(name, colorInput.value);
      nameInput.value = '';
      renderSiteManagerTable();
    }
  });

  // Universal Modal Dismiss Handlers (Backdrop click, Close buttons, ESC key)
  document.querySelectorAll('.modal-backdrop, .modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });

  document.querySelectorAll('.modal-close, .close-modal, .modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop, .modal');
      if (modal) modal.classList.add('hidden');
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop:not(.hidden), .modal:not(.hidden)').forEach(modal => {
        modal.classList.add('hidden');
      });
    }
  });

});
