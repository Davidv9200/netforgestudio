/* NetForge Studio - State Management & History Engine */

class AppState {
  constructor() {
    this.nodes = [];
    this.cables = [];
    
    this.selectedId = null;
    this.selectionType = null; // 'node', 'cable'
    
    // History stack for Undo/Redo
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 40;
    
    this.snapToGrid = true;
    this.gridSize = 20;
    this.showSiteGroups = true;
    this.showVlanBadges = true;
    this.availableSites = ['Site A (HQ)', 'Site B (Branch)', 'Data Center', 'Cloud VPC', 'Remote Office'];
    this.siteRegions = {
      'Site A (HQ)': { x: 60, y: 60, width: 440, height: 320, color: '#3b82f6' },
      'Site B (Branch)': { x: 540, y: 60, width: 440, height: 320, color: '#10b981' },
      'Data Center': { x: 60, y: 420, width: 440, height: 320, color: '#f59e0b' },
      'Cloud VPC': { x: 540, y: 420, width: 440, height: 320, color: '#8b5cf6' }
    };
    
    this.wiringMode = false;
    this.wiringSourceNodeId = null;
    this.wiringSourcePort = null;
    this.wiringCableType = 'cat6';
    this.wiringCableStyle = 'bezier';
    
    this.selectedNodeIds = [];

    this.zoomLevel = 1.0;
    this.panX = 0;
    this.panY = 0;
  }

  getSiteRegion(siteName) {
    if (!this.siteRegions[siteName]) {
      const count = Object.keys(this.siteRegions).length;
      const col = count % 3;
      const row = Math.floor(count / 3);
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
      this.siteRegions[siteName] = {
        x: 60 + col * 480,
        y: 60 + row * 360,
        width: 440,
        height: 320,
        color: colors[count % colors.length]
      };
    }
    return this.siteRegions[siteName];
  }

  constrainNodeToSite(nodeId, x, y) {
    const node = this.getNodeById(nodeId);
    if (!node) return { x, y };

    const siteName = node.site || 'Site A (HQ)';
    const region = this.getSiteRegion(siteName);

    const minX = region.x + 16;
    const maxX = region.x + region.width - 72 - 16;
    const minY = region.y + 40;
    const maxY = region.y + region.height - 72 - 16;

    const constrainedX = Math.max(minX, Math.min(x, maxX));
    const constrainedY = Math.max(minY, Math.min(y, maxY));

    return { x: constrainedX, y: constrainedY };
  }

  // Push snapshot to history stack
  saveSnapshot() {
    // Truncate redo states
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    
    const snapshot = {
      nodes: JSON.parse(JSON.stringify(this.nodes)),
      cables: JSON.parse(JSON.stringify(this.cables)),
      availableSites: JSON.parse(JSON.stringify(this.availableSites)),
      siteRegions: JSON.parse(JSON.stringify(this.siteRegions))
    };
    
    this.history.push(snapshot);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }

    this.saveToLocalStorage();
  }

  saveToLocalStorage() {
    try {
      const data = {
        nodes: this.nodes,
        cables: this.cables,
        availableSites: this.availableSites,
        siteRegions: this.siteRegions
      };
      localStorage.setItem('netforge_topology_state', JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save skipped:', e);
    }
  }

  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('netforge_topology_state');
      if (saved) {
        const data = JSON.parse(saved);
        if (data && (data.nodes || data.cables)) {
          this.loadTopology(data);
          return true;
        }
      }
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
    }
    return false;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.loadSnapshot(this.history[this.historyIndex]);
      return true;
    }
    return false;
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.loadSnapshot(this.history[this.historyIndex]);
      return true;
    }
    return false;
  }

  loadSnapshot(snapshot) {
    this.nodes = JSON.parse(JSON.stringify(snapshot.nodes));
    this.cables = JSON.parse(JSON.stringify(snapshot.cables));
    if (snapshot.availableSites) this.availableSites = JSON.parse(JSON.stringify(snapshot.availableSites));
    if (snapshot.siteRegions) this.siteRegions = JSON.parse(JSON.stringify(snapshot.siteRegions));
    this.clearSelection();
    window.dispatchEvent(new CustomEvent('state-changed'));
  }

  // Node CRUD & Interface management
  addNodeInterface(nodeId, ifaceData = {}) {
    const node = this.getNodeById(nodeId);
    if (!node) return null;

    if (!node.interfaces) node.interfaces = {};

    const keys = Object.keys(node.interfaces);
    const count = keys.length;
    const key = 'iface_' + Date.now();
    const sides = ['top', 'bottom', 'left', 'right'];
    const chosenSide = ifaceData.side || sides[count % 4];

    const newIface = {
      name: ifaceData.name || `eth${count}`,
      side: chosenSide,
      ip: ifaceData.ip || `192.168.${count + 1}.1`,
      mask: ifaceData.mask || '255.255.255.0',
      vlan: ifaceData.vlan || 'VLAN 1',
      mode: ifaceData.mode || 'Access',
      status: ifaceData.status || 'up',
      mac: ifaceData.mac || window.DeviceRegistry.generateRandomMac()
    };

    node.interfaces[key] = newIface;
    if (!node.ports.includes(newIface.name)) node.ports.push(newIface.name);

    this.saveSnapshot();
    window.dispatchEvent(new CustomEvent('state-changed'));
    return { key, iface: newIface };
  }

  removeNodeInterface(nodeId, ifaceKey) {
    const node = this.getNodeById(nodeId);
    if (!node || !node.interfaces || !node.interfaces[ifaceKey]) return false;

    delete node.interfaces[ifaceKey];
    this.saveSnapshot();
    window.dispatchEvent(new CustomEvent('state-changed'));
    return true;
  }

  getSiteAtPosition(x, y) {
    const sites = this.availableSites && this.availableSites.length > 0 ? this.availableSites : ['Site A (HQ)'];
    for (const siteName of sites) {
      const region = this.getSiteRegion(siteName);
      if (x >= region.x - 40 && x <= region.x + region.width + 40 &&
          y >= region.y - 40 && y <= region.y + region.height + 40) {
        return siteName;
      }
    }
    return null;
  }

  addNode(nodeData) {
    const def = window.DeviceRegistry.getDeviceDef(nodeData.type);
    const id = 'node_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    let siteName = nodeData.site;
    if (!siteName && nodeData.x !== undefined && nodeData.y !== undefined) {
      siteName = this.getSiteAtPosition(nodeData.x, nodeData.y) || (this.availableSites[0] || 'Site A (HQ)');
    } else if (!siteName) {
      siteName = this.availableSites[0] || 'Site A (HQ)';
    }

    const region = this.getSiteRegion(siteName);
    const siteNodes = this.nodes.filter(n => (n.site || 'Site A (HQ)') === siteName);
    const idx = siteNodes.length;

    let initialX = nodeData.x !== undefined ? nodeData.x : (region.x + 30 + (idx % 3) * 120);
    let initialY = nodeData.y !== undefined ? nodeData.y : (region.y + 50 + Math.floor(idx / 3) * 110);
    
    // Default interfaces map with clean names (eth0, eth1, eth2, eth3) defaulting to VLAN 1
    const defaultInterfaces = nodeData.interfaces || {
      top: { name: 'eth0', side: 'top', ip: nodeData.ip || def.defaultIp, mask: nodeData.mask || def.defaultMask, vlan: 'VLAN 1', mode: 'Access', status: 'up', mac: nodeData.mac || window.DeviceRegistry.generateRandomMac() },
      bottom: { name: 'eth1', side: 'bottom', ip: '192.168.2.1', mask: '255.255.255.0', vlan: 'VLAN 1', mode: 'Access', status: 'up', mac: window.DeviceRegistry.generateRandomMac() },
      left: { name: 'eth2', side: 'left', ip: '192.168.3.1', mask: '255.255.255.0', vlan: 'VLAN 1', mode: 'Access', status: 'up', mac: window.DeviceRegistry.generateRandomMac() },
      right: { name: 'eth3', side: 'right', ip: '192.168.4.1', mask: '255.255.255.0', vlan: 'VLAN 1', mode: 'Access', status: 'up', mac: window.DeviceRegistry.generateRandomMac() }
    };
    
    const newNode = {
      id: id,
      type: nodeData.type,
      name: nodeData.name || def.name,
      hostname: nodeData.hostname || (nodeData.type + '-' + (this.nodes.length + 1)),
      ip: nodeData.ip || def.defaultIp,
      mask: nodeData.mask || def.defaultMask,
      gateway: nodeData.gateway || '192.168.1.1',
      mac: nodeData.mac || window.DeviceRegistry.generateRandomMac(),
      x: initialX,
      y: initialY,
      status: nodeData.status || 'online',
      accentColor: def.accentColor,
      ports: nodeData.ports || [...def.ports],
      interfaces: defaultInterfaces,
      assignedVlan: nodeData.assignedVlan || 'VLAN 1',
      site: siteName,
      notes: nodeData.notes || ''
    };
    
    this.nodes.push(newNode);
    this.selectItem(id, 'node');
    this.saveSnapshot();
    window.dispatchEvent(new CustomEvent('state-changed'));
    return newNode;
  }

  updateNode(id, props) {
    const node = this.getNodeById(id);
    if (node) {
      if (props.site && props.site !== node.site) {
        // Relocate node inside target site region
        const region = this.getSiteRegion(props.site);
        const targetSiteNodes = this.nodes.filter(n => n.id !== id && (n.site || 'Site A (HQ)') === props.site);
        const idx = targetSiteNodes.length;
        props.x = region.x + 30 + (idx % 3) * 120;
        props.y = region.y + 50 + Math.floor(idx / 3) * 110;
      }
      Object.assign(node, props);
      this.saveSnapshot();
      window.dispatchEvent(new CustomEvent('state-changed'));
    }
  }

  updateNodePosition(id, x, y) {
    const node = this.getNodeById(id);
    if (node) {
      node.x = x;
      node.y = y;
    }
  }

  setZoom(level) {
    this.zoomLevel = Math.min(Math.max(level, 0.25), 3.0);
    window.dispatchEvent(new CustomEvent('zoom-changed', { detail: { zoom: this.zoomLevel } }));
  }

  removeNode(id) {
    this.nodes = this.nodes.filter(n => n.id !== id);
    // Remove associated cables
    this.cables = this.cables.filter(c => c.sourceId !== id && c.targetId !== id);
    if (this.selectedId === id) this.clearSelection();
    this.saveSnapshot();
    window.dispatchEvent(new CustomEvent('state-changed'));
  }

  getNodeById(id) {
    return this.nodes.find(n => n.id === id);
  }

  // Cable CRUD operations
  addCable(cableData) {
    // Prevent duplicate connection on same occupied port side
    const sourceOccupied = this.cables.some(c => 
      (c.sourceId === cableData.sourceId && c.sourceSide === cableData.sourceSide) ||
      (c.targetId === cableData.sourceId && c.targetSide === cableData.sourceSide)
    );

    const targetOccupied = this.cables.some(c => 
      (c.sourceId === cableData.targetId && c.sourceSide === cableData.targetSide) ||
      (c.targetId === cableData.targetId && c.targetSide === cableData.targetSide)
    );

    if (sourceOccupied || targetOccupied) return null;

    const id = 'cable_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newCable = {
      id: id,
      sourceId: cableData.sourceId,
      targetId: cableData.targetId,
      sourcePort: cableData.sourcePort || 'eth0',
      targetPort: cableData.targetPort || 'eth0',
      sourceSide: cableData.sourceSide,
      targetSide: cableData.targetSide,
      mediaType: cableData.mediaType || this.wiringCableType || 'cat6',
      style: cableData.style || this.wiringCableStyle || 'bezier',
      bandwidth: cableData.mediaType === 'fiber' ? '100 Gbps' : (cableData.mediaType === 'wireless' ? '1.2 Gbps' : '10 Gbps'),
      status: 'up',
      latency: '1ms'
    };

    this.cables.push(newCable);
    this.saveSnapshot();
    window.dispatchEvent(new CustomEvent('state-changed'));
    return newCable;
  }

  removeCable(id) {
    this.cables = this.cables.filter(c => c.id !== id);
    if (this.selectedId === id) this.clearSelection();
    this.saveSnapshot();
    window.dispatchEvent(new CustomEvent('state-changed'));
  }

  getCableById(id) {
    return this.cables.find(c => c.id === id);
  }

  // Multi-Selection state
  toggleNodeSelection(nodeId, multi = false) {
    if (!multi) {
      this.selectedNodeIds = [nodeId];
    } else {
      const idx = this.selectedNodeIds.indexOf(nodeId);
      if (idx >= 0) {
        this.selectedNodeIds.splice(idx, 1);
      } else {
        this.selectedNodeIds.push(nodeId);
      }
    }
    this.selectedId = this.selectedNodeIds[0] || null;
    this.selectionType = this.selectedNodeIds.length > 0 ? 'node' : null;
    window.dispatchEvent(new CustomEvent('selection-changed', { detail: { id: this.selectedId, type: this.selectionType, selectedNodeIds: this.selectedNodeIds } }));
    window.dispatchEvent(new CustomEvent('state-changed'));
  }

  clearMultiSelection() {
    this.selectedNodeIds = [];
    this.clearSelection();
  }

  // Site Management methods
  createSite(siteName, color = '#0284c7') {
    if (!siteName) return;
    const reg = this.getSiteRegion(siteName);
    reg.color = color;
    if (!this.availableSites.includes(siteName)) {
      this.availableSites.push(siteName);
    }
    this.saveSnapshot();
    window.dispatchEvent(new CustomEvent('state-changed'));
    return reg;
  }

  renameSite(oldName, newName) {
    if (!oldName || !newName || oldName === newName) return;
    if (this.siteRegions[oldName]) {
      this.siteRegions[newName] = { ...this.siteRegions[oldName], name: newName };
      delete this.siteRegions[oldName];
    }
    const idx = this.availableSites.indexOf(oldName);
    if (idx >= 0) {
      this.availableSites[idx] = newName;
    }
    this.nodes.forEach(n => {
      if ((n.site || 'Site A (HQ)') === oldName) {
        n.site = newName;
      }
    });
    this.saveSnapshot();
    window.dispatchEvent(new CustomEvent('state-changed'));
  }

  setSiteColor(siteName, color) {
    const reg = this.getSiteRegion(siteName);
    reg.color = color;
    this.saveSnapshot();
    window.dispatchEvent(new CustomEvent('state-changed'));
  }

  deleteSite(siteName) {
    if (Object.keys(this.siteRegions).length <= 1) return false;
    delete this.siteRegions[siteName];
    this.availableSites = this.availableSites.filter(s => s !== siteName);
    const fallbackSite = Object.keys(this.siteRegions)[0] || 'Site A (HQ)';
    this.nodes.forEach(n => {
      if (n.site === siteName) {
        n.site = fallbackSite;
      }
    });
    this.saveSnapshot();
    window.dispatchEvent(new CustomEvent('state-changed'));
    return true;
  }

  // Alignment methods
  alignSelectedNodes(type) {
    if (this.selectedNodeIds.length < 2) return;
    const selectedNodes = this.nodes.filter(n => this.selectedNodeIds.includes(n.id));
    if (selectedNodes.length < 2) return;

    if (type === 'left') {
      const minX = Math.min(...selectedNodes.map(n => n.x));
      selectedNodes.forEach(n => this.updateNodePosition(n.id, minX, n.y));
    } else if (type === 'center-h') {
      const avgX = Math.round(selectedNodes.reduce((sum, n) => sum + n.x, 0) / selectedNodes.length);
      selectedNodes.forEach(n => this.updateNodePosition(n.id, avgX, n.y));
    } else if (type === 'right') {
      const maxX = Math.max(...selectedNodes.map(n => n.x));
      selectedNodes.forEach(n => this.updateNodePosition(n.id, maxX, n.y));
    } else if (type === 'top') {
      const minY = Math.min(...selectedNodes.map(n => n.y));
      selectedNodes.forEach(n => this.updateNodePosition(n.id, n.x, minY));
    } else if (type === 'center-v') {
      const avgY = Math.round(selectedNodes.reduce((sum, n) => sum + n.y, 0) / selectedNodes.length);
      selectedNodes.forEach(n => this.updateNodePosition(n.id, n.x, avgY));
    } else if (type === 'bottom') {
      const maxY = Math.max(...selectedNodes.map(n => n.y));
      selectedNodes.forEach(n => this.updateNodePosition(n.id, n.x, maxY));
    }
    this.saveSnapshot();
  }

  bulkAssignSite(siteName) {
    if (!siteName || this.selectedNodeIds.length === 0) return;
    this.selectedNodeIds.forEach(id => {
      const node = this.getNodeById(id);
      if (node) {
        node.site = siteName;
        const region = this.getSiteRegion(siteName);
        node.x = Math.max(region.x + 16, Math.min(node.x, region.x + region.width - 72 - 16));
        node.y = Math.max(region.y + 40, Math.min(node.y, region.y + region.height - 72 - 16));
      }
    });
    this.saveSnapshot();
    window.dispatchEvent(new CustomEvent('state-changed'));
  }

  // Selection state
  selectItem(id, type) {
    this.selectedId = id;
    this.selectionType = type;
    this.selectedNodeIds = id && type === 'node' ? [id] : [];
    window.dispatchEvent(new CustomEvent('selection-changed', { detail: { id, type, selectedNodeIds: this.selectedNodeIds } }));
  }

  clearSelection() {
    this.selectedId = null;
    this.selectionType = null;
    this.selectedNodeIds = [];
    window.dispatchEvent(new CustomEvent('selection-changed', { detail: { id: null, type: null, selectedNodeIds: [] } }));
  }

  // Bulk Load Topology
  loadTopology(data) {
    this.nodes = data.nodes || [];
    this.cables = data.cables || [];
    
    if (data.availableSites && data.availableSites.length > 0) {
      this.availableSites = data.availableSites;
    } else {
      const loadedSites = Array.from(new Set(this.nodes.map(n => n.site).filter(Boolean)));
      this.availableSites = loadedSites.length > 0 
        ? loadedSites 
        : ['Site A (HQ)', 'Site B (Branch)', 'Data Center', 'Cloud VPC', 'Remote Office'];
    }

    if (data.siteRegions) {
      this.siteRegions = data.siteRegions;
    }

    this.history = [];
    this.historyIndex = -1;
    this.saveSnapshot();
    this.clearSelection();
    window.dispatchEvent(new CustomEvent('state-changed'));
  }
}

window.appState = new AppState();
