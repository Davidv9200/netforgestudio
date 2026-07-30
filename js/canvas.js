/* NetForge Studio - Canvas Workspace Controller */

class CanvasController {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.svgLayer = document.getElementById('canvas-svg');
    this.nodesLayer = document.getElementById('canvas-nodes');
    this.cablesGroup = document.getElementById('svg-cables-group');
    this.tempCableGroup = document.getElementById('svg-temp-cable-group');
    this.minimapCanvas = document.getElementById('minimap-canvas');

    this.isPanning = false;
    this.startPanX = 0;
    this.startPanY = 0;

    this.draggedNodeId = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    this.tempCableStartNode = null;
    this.tempCableStartPort = null;
    this.tempCableStartSide = null;

    this.initEvents();
    this.bindStateEvents();
    this.renderAll();
  }

  initEvents() {
    // Canvas Panning Logic or Marquee Drag Selection
    this.container.addEventListener('mousedown', (e) => {
      if (e.target === this.container || e.target === this.svgLayer || e.target.id === 'canvas-svg') {
        const rect = this.container.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - window.appState.panX) / window.appState.zoomLevel;
        const mouseY = (e.clientY - rect.top - window.appState.panY) / window.appState.zoomLevel;

        if (e.shiftKey) {
          // Start marquee selection
          this.isMarqueeSelecting = true;
          this.marqueeStartX = mouseX;
          this.marqueeStartY = mouseY;

          let marqueeBox = document.getElementById('selection-marquee-box');
          if (!marqueeBox) {
            marqueeBox = document.createElement('div');
            marqueeBox.id = 'selection-marquee-box';
            marqueeBox.className = 'marquee-selection-box';
            this.container.appendChild(marqueeBox);
          }
          marqueeBox.style.left = `${e.clientX - rect.left}px`;
          marqueeBox.style.top = `${e.clientY - rect.top}px`;
          marqueeBox.style.width = '0px';
          marqueeBox.style.height = '0px';
          marqueeBox.style.display = 'block';
        } else {
          window.appState.clearMultiSelection();
          this.isPanning = true;
          this.startPanX = e.clientX - window.appState.panX;
          this.startPanY = e.clientY - window.appState.panY;
          this.container.style.cursor = 'grabbing';
        }
      }
    });

    window.addEventListener('mousemove', (e) => {
      // Panning canvas
      if (this.isPanning) {
        window.appState.panX = e.clientX - this.startPanX;
        window.appState.panY = e.clientY - this.startPanY;
        this.applyTransform();
        return;
      }

      // Marquee selection active
      if (this.isMarqueeSelecting) {
        const rect = this.container.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - window.appState.panX) / window.appState.zoomLevel;
        const mouseY = (e.clientY - rect.top - window.appState.panY) / window.appState.zoomLevel;

        const minX = Math.min(this.marqueeStartX, mouseX);
        const minY = Math.min(this.marqueeStartY, mouseY);
        const maxX = Math.max(this.marqueeStartX, mouseX);
        const maxY = Math.max(this.marqueeStartY, mouseY);

        const marqueeBox = document.getElementById('selection-marquee-box');
        if (marqueeBox) {
          const domMinX = minX * window.appState.zoomLevel + window.appState.panX;
          const domMinY = minY * window.appState.zoomLevel + window.appState.panY;
          const domW = (maxX - minX) * window.appState.zoomLevel;
          const domH = (maxY - minY) * window.appState.zoomLevel;
          marqueeBox.style.left = `${domMinX}px`;
          marqueeBox.style.top = `${domMinY}px`;
          marqueeBox.style.width = `${domW}px`;
          marqueeBox.style.height = `${domH}px`;
        }

        // Select all nodes inside rectangle
        const selectedIds = [];
        window.appState.nodes.forEach(n => {
          if (n.x + 72 >= minX && n.x <= maxX && n.y + 72 >= minY && n.y <= maxY) {
            selectedIds.push(n.id);
          }
        });
        window.appState.selectedNodeIds = selectedIds;
        window.dispatchEvent(new CustomEvent('selection-changed', { detail: { selectedNodeIds: selectedIds } }));
        return;
      }

      // Dragging network device node(s)
      if (this.draggedNodeId) {
        const rect = this.container.getBoundingClientRect();
        let mouseX = (e.clientX - rect.left - window.appState.panX) / window.appState.zoomLevel;
        let mouseY = (e.clientY - rect.top - window.appState.panY) / window.appState.zoomLevel;

        let newX = mouseX - this.dragOffsetX;
        let newY = mouseY - this.dragOffsetY;

        if (window.appState.snapToGrid) {
          const sz = window.appState.gridSize;
          newX = Math.round(newX / sz) * sz;
          newY = Math.round(newY / sz) * sz;
        }

        const primaryNode = window.appState.getNodeById(this.draggedNodeId);
        if (primaryNode) {
          const deltaX = newX - this.dragStartNodeX;
          const deltaY = newY - this.dragStartNodeY;

          // Drag all nodes in multi-selection group together
          const groupIds = window.appState.selectedNodeIds.includes(this.draggedNodeId)
            ? window.appState.selectedNodeIds
            : [this.draggedNodeId];

          groupIds.forEach(id => {
            const initialPos = this.dragGroupInitialPositions[id];
            if (initialPos) {
              const targetX = initialPos.x + deltaX;
              const targetY = initialPos.y + deltaY;
              window.appState.updateNodePosition(id, targetX, targetY);
              const currN = window.appState.getNodeById(id);
              const nEl = this.nodesLayer.querySelector(`[data-id="${id}"]`);
              if (nEl && currN) {
                nEl.style.left = `${currN.x}px`;
                nEl.style.top = `${currN.y}px`;
              }
            }
          });
        }

        this.renderSites();
        this.renderCables();
        return;
      }

      // Cable wiring preview path
      if (window.appState.wiringMode && this.tempCableStartNode) {
        const rect = this.container.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - window.appState.panX) / window.appState.zoomLevel;
        const mouseY = (e.clientY - rect.top - window.appState.panY) / window.appState.zoomLevel;

        const startCoords = window.CableRenderer.getNodePortCoords(
          this.tempCableStartNode, 
          this.tempCableStartSide || 'right'
        );

        const pathData = window.CableRenderer.generatePathString(startCoords, { x: mouseX, y: mouseY }, window.appState.wiringCableStyle);
        this.tempCableGroup.innerHTML = `<path d="${pathData}" class="temp-cable-path ${window.appState.wiringCableType}" />`;
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isMarqueeSelecting) {
        this.isMarqueeSelecting = false;
        const marqueeBox = document.getElementById('selection-marquee-box');
        if (marqueeBox) {
          marqueeBox.style.display = 'none';
        }
      }
      if (this.isPanning) {
        this.isPanning = false;
        this.container.style.cursor = 'default';
        window.appState.saveSnapshot();
      }
      if (this.draggedNodeId) {
        this.draggedNodeId = null;
        window.appState.saveSnapshot();
      }
    });

    const toggleSitesBtn = document.getElementById('btn-toggle-sites');
    if (toggleSitesBtn) {
      toggleSitesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.appState.showSiteGroups = !window.appState.showSiteGroups;
        toggleSitesBtn.classList.toggle('active', window.appState.showSiteGroups);
        this.renderSites();
      });
    }

    // VLAN badges toggle button listener
    const toggleVlansBtn = document.getElementById('btn-toggle-vlans');
    if (toggleVlansBtn) {
      toggleVlansBtn.addEventListener('click', () => {
        window.appState.showVlanBadges = !window.appState.showVlanBadges;
        toggleVlansBtn.classList.toggle('active', window.appState.showVlanBadges);
        this.renderNodes();
        this.renderCables();
      });
    }

    // Context menu trigger
    const ctxMenu = document.getElementById('context-menu');
    this.container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (ctxMenu) {
        ctxMenu.style.left = `${e.clientX}px`;
        ctxMenu.style.top = `${e.clientY}px`;
        ctxMenu.classList.remove('hidden');
      }
    });

    document.addEventListener('click', () => {
      if (ctxMenu) ctxMenu.classList.add('hidden');
    });

    // Zooming Canvas with Mouse Wheel
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      let newZoom = window.appState.zoomLevel * zoomFactor;
      newZoom = Math.min(Math.max(newZoom, 0.25), 3.0);
      
      window.appState.setZoom(newZoom);
      this.applyTransform();
    }, { passive: false });

    // Drag and Drop Devices from Sidebar
    this.container.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    this.container.addEventListener('drop', (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('text/plain');
      if (!type) return;

      const rect = this.container.getBoundingClientRect();
      let dropX = (e.clientX - rect.left - window.appState.panX) / window.appState.zoomLevel - 36;
      let dropY = (e.clientY - rect.top - window.appState.panY) / window.appState.zoomLevel - 36;

      if (window.appState.snapToGrid) {
        const sz = window.appState.gridSize;
        dropX = Math.round(dropX / sz) * sz;
        dropY = Math.round(dropY / sz) * sz;
      }

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
    });

    // ESC Key listener to cancel cable wiring mode & Delete key to remove selected
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && window.appState.wiringMode) {
        this.cancelWiringMode();
      }
      if (e.key === 'Delete' && window.appState.selectedId) {
        if (window.appState.selectionType === 'node') window.appState.removeNode(window.appState.selectedId);
        else if (window.appState.selectionType === 'cable') window.appState.removeCable(window.appState.selectedId);
      }
    });
  }

  bindStateEvents() {
    window.addEventListener('state-changed', () => {
      this.renderAll();
    });

    window.addEventListener('selection-changed', () => {
      this.renderNodes();
      this.renderCables();
    });
  }

  applyTransform() {
    const transformStr = `translate(${window.appState.panX}px, ${window.appState.panY}px) scale(${window.appState.zoomLevel})`;
    this.svgLayer.style.transform = transformStr;
    this.nodesLayer.style.transform = transformStr;
    this.updateMinimap();
  }

  renderAll() {
    this.renderSites();
    this.renderNodes();
    this.renderCables();
    this.updateMinimap();
  }

  // Check if a specific port dot on a node is occupied by a cable
  isPortOccupied(node, portPosition) {
    return window.appState.cables.some(c => 
      (c.sourceId === node.id && (c.sourceSide === portPosition || c.sourcePort === portPosition)) ||
      (c.targetId === node.id && (c.targetSide === portPosition || c.targetPort === portPosition))
    );
  }

  // Render node DOM elements
  renderNodes() {
    this.nodesLayer.innerHTML = '';

    window.appState.nodes.forEach(node => {
      const isNodeSelected = (window.appState.selectedNodeIds && window.appState.selectedNodeIds.includes(node.id)) || window.appState.selectedId === node.id;
      const nodeEl = document.createElement('div');
      nodeEl.className = `network-node ${isNodeSelected ? 'selected' : ''}`;
      nodeEl.style.left = `${node.x}px`;
      nodeEl.style.top = `${node.y}px`;
      nodeEl.style.setProperty('--accent-color', node.accentColor || '#3b82f6');
      nodeEl.setAttribute('data-id', node.id);

      const def = window.DeviceRegistry.getDeviceDef(node.type);

      // Ensure default interfaces dictionary exists
      if (!node.interfaces) {
        node.interfaces = {
          top: { name: 'eth0', side: 'top', ip: node.ip || '192.168.1.1', mask: node.mask || '255.255.255.0', vlan: node.assignedVlan || 'VLAN 10', mode: 'Access', status: 'up', mac: node.mac || '52:54:00:12:34:56' },
          bottom: { name: 'eth1', side: 'bottom', ip: '192.168.20.1', mask: '255.255.255.0', vlan: 'VLAN 20', mode: 'Access', status: 'up', mac: window.DeviceRegistry.generateRandomMac() },
          left: { name: 'eth2', side: 'left', ip: '192.168.30.1', mask: '255.255.255.0', vlan: 'VLAN 30', mode: 'Access', status: 'up', mac: window.DeviceRegistry.generateRandomMac() },
          right: { name: 'eth3', side: 'right', ip: '192.168.40.1', mask: '255.255.255.0', vlan: 'VLAN 40', mode: 'Access', status: 'up', mac: window.DeviceRegistry.generateRandomMac() }
        };
      }

      // Group interfaces by side for even distribution
      let portDotsHtml = '';
      const sideGroups = { top: [], bottom: [], left: [], right: [] };

      Object.entries(node.interfaces).forEach(([ifaceKey, iface]) => {
        const side = iface.side || ifaceKey;
        const validSide = ['top', 'bottom', 'left', 'right'].includes(side) ? side : 'top';
        sideGroups[validSide].push({ key: ifaceKey, ...iface });
      });

      ['top', 'bottom', 'left', 'right'].forEach(side => {
        const list = sideGroups[side];
        const total = list.length;
        list.forEach((iface, idx) => {
          const isOcc = this.isPortOccupied(node, iface.key) || this.isPortOccupied(node, side);
          const posVal = Math.round((idx + 1) * (72 / (total + 1)) - 6);
          let posStyle = '';

          if (side === 'top') posStyle = `top: -6px; left: ${posVal}px;`;
          else if (side === 'bottom') posStyle = `bottom: -6px; left: ${posVal}px;`;
          else if (side === 'left') posStyle = `left: -6px; top: ${posVal}px;`;
          else if (side === 'right') posStyle = `right: -6px; top: ${posVal}px;`;

          const ipStr = iface.ip ? `IP: ${iface.ip}` : 'IP: None';
          const maskStr = iface.mask ? ` (${iface.mask})` : '';
          const vlanStr = iface.vlan ? ` | ${iface.vlan}` : '';
          const statusStr = isOcc ? ' [CONNECTED]' : ' (Free)';
          const portTitle = `Interface: ${iface.name}\n${ipStr}${maskStr}${vlanStr}\nMode: ${iface.mode || 'Access'}${statusStr}`;

          portDotsHtml += `<div class="node-port-dot ${side} ${isOcc ? 'occupied' : ''}" data-port="${iface.key}" data-side="${side}" style="${posStyle}" title="${portTitle}"></div>`;
        });
      });

      nodeEl.innerHTML = `
        <div class="node-icon-box">${def.iconSvg}</div>
        <div class="node-hostname-inside" title="${node.hostname}">${node.hostname}</div>
        <div class="node-status-badge ${node.status || 'online'}"></div>
        ${portDotsHtml}
      `;

      // Node selection & drag handles
      nodeEl.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('node-port-dot')) {
          this.handlePortClick(node, e.target.getAttribute('data-port'), e);
          return;
        }
        e.stopPropagation();

        if (e.shiftKey) {
          window.appState.toggleNodeSelection(node.id, true);
        } else if (!window.appState.selectedNodeIds.includes(node.id)) {
          window.appState.toggleNodeSelection(node.id, false);
        }
        
        this.draggedNodeId = node.id;
        const rect = this.container.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - window.appState.panX) / window.appState.zoomLevel;
        const mouseY = (e.clientY - rect.top - window.appState.panY) / window.appState.zoomLevel;
        this.dragOffsetX = mouseX - node.x;
        this.dragOffsetY = mouseY - node.y;

        this.dragStartNodeX = node.x;
        this.dragStartNodeY = node.y;

        // Record initial positions of all selected nodes in group
        this.dragGroupInitialPositions = {};
        const groupIds = window.appState.selectedNodeIds.includes(node.id) 
          ? window.appState.selectedNodeIds 
          : [node.id];

        groupIds.forEach(id => {
          const n = window.appState.getNodeById(id);
          if (n) this.dragGroupInitialPositions[id] = { x: n.x, y: n.y };
        });
      });

      this.nodesLayer.appendChild(nodeEl);
    });
  }

  // Handle port wiring logic
  handlePortClick(node, portPosition, event) {
    event.stopPropagation();

    if (this.isPortOccupied(node, portPosition)) {
      alert(`Port '${portPosition.toUpperCase()}' on ${node.hostname} already has an active cable attached! Delete existing cable to reuse this port.`);
      if (this.tempCableStartNode) {
        this.cancelWiringMode();
      }
      return;
    }

    if (!this.tempCableStartNode) {
      // First click: Pick source port dot
      this.tempCableStartNode = node;
      const sIface = node.interfaces?.[portPosition] || { name: 'eth0' };
      this.tempCableStartPort = sIface.name || 'eth0';
      this.tempCableStartSide = portPosition || 'right';
      window.appState.wiringMode = true;
      document.getElementById('wiring-banner').classList.remove('hidden');
    } else {
      // Second click: Pick target port dot
      if (this.tempCableStartNode.id !== node.id) {
        const tIface = node.interfaces?.[portPosition] || { name: 'eth1' };
        const targetPortName = tIface.name || 'eth1';

        const result = window.appState.addCable({
          sourceId: this.tempCableStartNode.id,
          targetId: node.id,
          sourcePort: this.tempCableStartPort,
          targetPort: targetPortName,
          sourceSide: this.tempCableStartSide || 'right',
          targetSide: portPosition || 'left',
          mediaType: window.appState.wiringCableType,
          style: window.appState.wiringCableStyle
        });

        if (!result) {
          alert('Port is already occupied! Cannot connect cable.');
        }
      }
      this.cancelWiringMode();
    }
  }

  cancelWiringMode() {
    this.tempCableStartNode = null;
    this.tempCableStartPort = null;
    this.tempCableStartSide = null;
    this.tempCableGroup.innerHTML = '';
    window.appState.wiringMode = false;
    document.getElementById('wiring-banner').classList.add('hidden');
  }

  renderSites() {
    if (!this.sitesGroup) this.sitesGroup = document.getElementById('svg-sites-group');
    if (!this.sitesGroup) return;

    this.sitesGroup.innerHTML = '';
    if (!window.appState.showSiteGroups) return;

    // Group nodes by site location
    const siteMap = {};
    window.appState.nodes.forEach(node => {
      const siteName = node.site || 'Site A (HQ)';
      if (!siteMap[siteName]) siteMap[siteName] = [];
      siteMap[siteName].push(node);
    });

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
    let colorIdx = 0;

    Object.entries(siteMap).forEach(([siteName, nodes]) => {
      if (!nodes || nodes.length === 0) return;

      const region = window.appState.getSiteRegion(siteName);
      const color = region.color || colors[colorIdx % colors.length];
      colorIdx++;

      // Compute dynamic bounding box wrapping tightly around all nodes of this site
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      nodes.forEach(n => {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + 72);
        maxY = Math.max(maxY, n.y + 72);
      });

      const padX = 24;
      const padY = 28;
      const x = minX - padX;
      const y = minY - padY;
      const w = Math.max(160, (maxX - minX) + padX * 2);
      const h = Math.max(120, (maxY - minY) + padY * 2);

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'site-group-container');
      g.style.pointerEvents = 'none';

      // Outer boundary rect wrapping dynamically around the site nodes
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', w);
      rect.setAttribute('height', h);
      rect.setAttribute('rx', '14');
      rect.setAttribute('fill', color);
      rect.setAttribute('fill-opacity', '0.04');
      rect.setAttribute('stroke', color);
      rect.setAttribute('stroke-width', '1.5');
      rect.setAttribute('stroke-dasharray', '5 4');
      rect.style.pointerEvents = 'none';
      g.appendChild(rect);

      // Site Header Label Badge
      const badgeW = Math.min(w - 16, Math.max(140, siteName.length * 8 + 40));
      const badgeRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      badgeRect.setAttribute('x', x + 12);
      badgeRect.setAttribute('y', y - 12);
      badgeRect.setAttribute('width', badgeW);
      badgeRect.setAttribute('height', 24);
      badgeRect.setAttribute('rx', '6');
      badgeRect.setAttribute('fill', color);
      badgeRect.style.pointerEvents = 'none';
      g.appendChild(badgeRect);

      const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      badgeText.setAttribute('x', x + 20);
      badgeText.setAttribute('y', y + 4);
      badgeText.setAttribute('fill', '#ffffff');
      badgeText.setAttribute('font-size', '11');
      badgeText.setAttribute('font-weight', '600');
      badgeText.setAttribute('font-family', 'sans-serif');
      badgeText.style.pointerEvents = 'none';
      badgeText.textContent = `📍 ${siteName} (${nodes.length} ${nodes.length === 1 ? 'Device' : 'Devices'})`;
      g.appendChild(badgeText);

      this.sitesGroup.appendChild(g);
    });
  }

  renderCables() {
    window.CableRenderer.renderCables(this.cablesGroup, window.appState.cables, window.appState.nodes, window.appState.selectedId);
  }

  // Minimap preview rendering
  updateMinimap() {
    if (!this.minimapCanvas) return;
    const ctx = this.minimapCanvas.getContext('2d');
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const bounds = { minX: 0, minY: 0, maxX: 1200, maxY: 800 };
    window.appState.nodes.forEach(n => {
      bounds.maxX = Math.max(bounds.maxX, n.x + 200);
      bounds.maxY = Math.max(bounds.maxY, n.y + 200);
    });

    const scaleX = w / bounds.maxX;
    const scaleY = h / bounds.maxY;

    // Draw nodes on minimap
    window.appState.nodes.forEach(n => {
      ctx.fillStyle = n.accentColor || '#3b82f6';
      ctx.fillRect(n.x * scaleX, n.y * scaleY, 8, 8);
    });

    // Draw cables on minimap
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    window.appState.cables.forEach(c => {
      const s = window.appState.getNodeById(c.sourceId);
      const t = window.appState.getNodeById(c.targetId);
      if (s && t) {
        ctx.beginPath();
        ctx.moveTo(s.x * scaleX, s.y * scaleY);
        ctx.lineTo(t.x * scaleX, t.y * scaleY);
        ctx.stroke();
      }
    });
  }
}

window.initCanvas = function() {
  window.canvasController = new CanvasController();
};
