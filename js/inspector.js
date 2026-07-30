/* NetForge Studio - Inspector Panel & Per-Interface Network Validator */

class InspectorPanel {
  constructor() {
    this.sidebar = document.getElementById('inspector-sidebar');
    this.title = document.getElementById('inspector-title');
    this.badge = document.getElementById('selection-type-badge');
    this.content = document.getElementById('inspector-content');

    this.currentIfaceKey = 'top';

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('selection-changed', (e) => {
      this.render(e.detail.id, e.detail.type);
    });
  }

  isPortOccupied(node, portPosition) {
    return window.appState.cables.some(c => 
      (c.sourceId === node.id && (c.sourceSide === portPosition || c.sourcePort === portPosition)) ||
      (c.targetId === node.id && (c.targetSide === portPosition || c.targetPort === portPosition))
    );
  }

  render(id, type) {
    if (type === 'node') this.renderNodeInspector(id);
    else if (type === 'cable') this.renderCableInspector(id);
  }

  renderNodeInspector(id) {
    const node = window.appState.getNodeById(id);
    if (!node) return;

    this.badge.textContent = 'Device Node';
    this.badge.className = 'selection-type-badge';

    // Ensure default interfaces dictionary exists
    if (!node.interfaces) {
      node.interfaces = {
        top: { name: node.ports?.[0] || 'eth0 (Top Port)', ip: node.ip || '192.168.1.1', mask: node.mask || '255.255.255.0', vlan: node.assignedVlan || 'VLAN 10', mode: 'Access', status: 'up', mac: node.mac || '52:54:00:12:34:56' },
        bottom: { name: node.ports?.[1] || 'eth1 (Bottom Port)', ip: '192.168.20.1', mask: '255.255.255.0', vlan: 'VLAN 20', mode: 'Access', status: 'up', mac: window.DeviceRegistry.generateRandomMac() },
        left: { name: node.ports?.[2] || 'eth2 (Left Port)', ip: '192.168.30.1', mask: '255.255.255.0', vlan: 'VLAN 30', mode: 'Access', status: 'up', mac: window.DeviceRegistry.generateRandomMac() },
        right: { name: node.ports?.[3] || 'eth3 (Right Port)', ip: '192.168.40.1', mask: '255.255.255.0', vlan: 'VLAN 40', mode: 'Access', status: 'up', mac: window.DeviceRegistry.generateRandomMac() }
      };
    }

    // Check primary IP conflict
    const ipConflict = window.appState.nodes.some(n => n.id !== id && n.ip === node.ip && node.ip !== '0.0.0.0');

    this.content.innerHTML = `
      <div class="inspector-group">
        <div class="group-title">General Identity & Site</div>
        <div class="prop-row">
          <label class="prop-label">Hostname</label>
          <input type="text" id="prop-hostname" class="prop-input" value="${node.hostname}">
        </div>
        <div class="prop-row">
          <label class="prop-label">Site / Facility Location</label>
          <select id="prop-site" class="prop-input" style="font-weight: 600;">
            ${(window.appState.availableSites || []).map(s => `
              <option value="${s}" ${(node.site || 'Site A (HQ)') === s ? 'selected' : ''}>
                📍 ${s}
              </option>
            `).join('')}
            <option value="__create_new__">+ Manage / Create New Site...</option>
          </select>
        </div>
        <div class="prop-row">
          <label class="prop-label">Device Role / Type</label>
          <input type="text" class="prop-input" value="${node.name}" readonly style="opacity:0.7">
        </div>
        <div class="prop-row">
          <label class="prop-label">Status</label>
          <select id="prop-status" class="prop-input">
            <option value="online" ${node.status === 'online' ? 'selected' : ''}>Online (Up)</option>
            <option value="warning" ${node.status === 'warning' ? 'selected' : ''}>Degraded (Warning)</option>
            <option value="offline" ${node.status === 'offline' ? 'selected' : ''}>Offline (Down)</option>
          </select>
        </div>
      </div>

      <div class="inspector-group">
        <div class="group-title">Primary Management IP</div>
        <div class="prop-row">
          <label class="prop-label">Primary IPv4 Address</label>
          <input type="text" id="prop-ip" class="prop-input mono" value="${node.ip}">
          ${ipConflict ? `<div class="ip-validation-warning"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Warning: Duplicate IP Address Conflict</div>` : ''}
        </div>
        <div class="prop-row">
          <label class="prop-label">Default Gateway</label>
          <input type="text" id="prop-gateway" class="prop-input mono" value="${node.gateway}">
        </div>
      </div>

      <div class="inspector-group">
        <div class="group-title">Per-Interface Configuration</div>
        <div class="prop-row">
          <label class="prop-label">Select Device Interface</label>
          <select id="prop-interface-select" class="prop-input" style="font-weight: 600; color: #38bdf8;">
            ${Object.entries(node.interfaces).map(([k, iface]) => `
              <option value="${k}" ${this.currentIfaceKey === k ? 'selected' : ''}>
                ${iface.name} [${(iface.side || k).toUpperCase()}] ${this.isPortOccupied(node, k) ? '● [CONNECTED]' : '(Free)'}
              </option>
            `).join('')}
          </select>
        </div>
        
        <div id="interface-details-container" style="display: flex; flex-direction: column; gap: 10px; margin-top: 6px; padding: 10px; background: rgba(15, 23, 42, 0.6); border-radius: 6px; border: 1px dashed var(--bg-panel-border);">
          <!-- Rendered dynamically -->
        </div>

        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <button id="btn-add-interface" class="btn secondary" style="flex: 1; color: var(--primary); font-size: 0.8rem;">+ Add Interface</button>
          <button id="btn-remove-interface" class="btn secondary" style="color: var(--accent-red); font-size: 0.8rem;">Delete Interface</button>
        </div>
      </div>

      <button id="btn-delete-node" class="btn secondary" style="color: var(--accent-red); margin-top: 10px;">Delete Node</button>
    `;

    // Render interface details panel
    const updateInterfaceBox = () => {
      const ifaceKey = this.currentIfaceKey;
      const iface = node.interfaces[ifaceKey] || { name: `eth (${ifaceKey})`, side: 'top', ip: '192.168.1.1', mask: '255.255.255.0', vlan: 'VLAN 10', mode: 'Access', status: 'up', mac: '00:00:00:00:00:00' };
      const box = document.getElementById('interface-details-container');
      if (!box) return;

      box.innerHTML = `
        <div class="prop-row">
          <label class="prop-label">Interface Name / Port Alias</label>
          <input type="text" id="iface-name" class="prop-input" value="${iface.name}">
        </div>
        <div class="prop-row">
          <label class="prop-label">Port Edge Location</label>
          <select id="iface-side" class="prop-input">
            <option value="top" ${iface.side === 'top' ? 'selected' : ''}>Top Edge</option>
            <option value="bottom" ${iface.side === 'bottom' ? 'selected' : ''}>Bottom Edge</option>
            <option value="left" ${iface.side === 'left' ? 'selected' : ''}>Left Edge</option>
            <option value="right" ${iface.side === 'right' ? 'selected' : ''}>Right Edge</option>
          </select>
        </div>

        <div style="background: rgba(56, 189, 248, 0.08); padding: 10px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.25); display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">
            🌐 IP & VLAN Configuration
          </div>

          <div class="prop-row">
            <label class="prop-label" style="color: #e2e8f0; font-weight: 500;">IPv4 Address</label>
            <input type="text" id="iface-ip" class="prop-input mono" value="${iface.ip}" placeholder="e.g. 192.168.1.1">
          </div>

          <div class="prop-row">
            <label class="prop-label" style="color: #e2e8f0; font-weight: 500;">Subnet Mask</label>
            <input type="text" id="iface-mask" class="prop-input mono" value="${iface.mask}">
          </div>

          <div class="prop-row">
            <label class="prop-label" style="color: #e2e8f0; font-weight: 500;">
              ${iface.mode === 'Trunk' ? 'Allowed Trunk VLANs' : 'Assigned VLAN / Tag'}
            </label>
            <div style="display: flex; gap: 6px;">
              <input type="text" id="iface-vlan" class="prop-input" value="${iface.vlan || (iface.mode === 'Trunk' ? 'Trunk' : 'VLAN 10')}" placeholder="${iface.mode === 'Trunk' ? 'e.g. Trunk' : 'e.g. VLAN 10'}" list="vlan-presets">
              <datalist id="vlan-presets">
                <option value="VLAN 1">
                <option value="VLAN 10">
                <option value="VLAN 20">
                <option value="VLAN 30">
                <option value="Trunk">
              </datalist>
              <button id="btn-quick-trunk" class="btn secondary" style="padding: 2px 8px; font-size: 0.7rem; color: #c084fc; border-color: rgba(192,132,252,0.4); white-space: nowrap;" title="Set as 802.1Q Trunk Port">
                ${iface.mode === 'Trunk' ? '✓ Trunk' : '🔀 Trunk'}
              </button>
            </div>
          </div>
        </div>

        <div class="prop-row">
          <label class="prop-label">Port Operation Mode</label>
          <select id="iface-mode" class="prop-input">
            <option value="Access" ${iface.mode === 'Access' ? 'selected' : ''}>Access Port (Untagged Single VLAN)</option>
            <option value="Trunk" ${iface.mode === 'Trunk' ? 'selected' : ''}>Trunk Port (802.1Q Tagged Multi-VLAN)</option>
            <option value="Routed" ${iface.mode === 'Routed' ? 'selected' : ''}>Routed (L3 Interface)</option>
          </select>
        </div>
        <div class="prop-row">
          <label class="prop-label">Port Admin Status</label>
          <select id="iface-status" class="prop-input">
            <option value="up" ${iface.status === 'up' ? 'selected' : ''}>Enabled (Up)</option>
            <option value="down" ${iface.status === 'down' ? 'selected' : ''}>Shutdown (Down)</option>
          </select>
        </div>
        <div class="prop-row">
          <label class="prop-label">MAC Address</label>
          <input type="text" id="iface-mac" class="prop-input mono" value="${iface.mac}">
        </div>
      `;

      // Event listeners for interface input fields
      document.getElementById('iface-name').addEventListener('change', (e) => {
        iface.name = e.target.value;
        iface.updatedAt = Date.now();
        window.appState.saveSnapshot();
        this.renderNodeInspector(id);
      });
      document.getElementById('iface-side').addEventListener('change', (e) => {
        iface.side = e.target.value;
        iface.updatedAt = Date.now();
        window.appState.saveSnapshot();
        window.dispatchEvent(new CustomEvent('state-changed'));
      });
      document.getElementById('iface-ip').addEventListener('change', (e) => {
        iface.ip = e.target.value;
        iface.updatedAt = Date.now();
        if (ifaceKey === 'top') node.ip = e.target.value;
        window.appState.saveSnapshot();
        window.dispatchEvent(new CustomEvent('state-changed'));
      });
      document.getElementById('iface-mask').addEventListener('change', (e) => {
        iface.mask = e.target.value;
        iface.updatedAt = Date.now();
        if (ifaceKey === 'top') node.mask = e.target.value;
        window.appState.saveSnapshot();
        window.dispatchEvent(new CustomEvent('state-changed'));
      });
      document.getElementById('iface-vlan').addEventListener('change', (e) => {
        const newVlan = e.target.value.trim();
        iface.vlan = newVlan;
        iface.updatedAt = Date.now();
        if (ifaceKey === 'top' || node.assignedVlan === 'VLAN 1' || node.assignedVlan === 'Default (1)') {
          node.assignedVlan = newVlan;
        }

        if (node.interfaces) {
          Object.values(node.interfaces).forEach(i => {
            if (i.vlan === 'VLAN 1' || i.vlan === 'Default (1)') {
              i.vlan = newVlan;
            }
          });
        }

        window.appState.saveSnapshot();
        window.dispatchEvent(new CustomEvent('state-changed'));
      });
      document.getElementById('iface-mode').addEventListener('change', (e) => {
        iface.mode = e.target.value;
        iface.updatedAt = Date.now();
        if (e.target.value === 'Trunk') {
          iface.vlan = 'Trunk';
        } else if (iface.vlan === 'Trunk') {
          iface.vlan = 'VLAN 10';
        }
        window.appState.saveSnapshot();
        window.dispatchEvent(new CustomEvent('state-changed'));
        this.renderNodeInspector(id);
      });
      document.getElementById('btn-quick-trunk').addEventListener('click', () => {
        iface.updatedAt = Date.now();
        if (iface.mode === 'Trunk') {
          iface.mode = 'Access';
          iface.vlan = 'VLAN 10';
        } else {
          iface.mode = 'Trunk';
          iface.vlan = 'Trunk';
        }
        window.appState.saveSnapshot();
        window.dispatchEvent(new CustomEvent('state-changed'));
        this.renderNodeInspector(id);
      });
      document.getElementById('iface-status').addEventListener('change', (e) => {
        iface.status = e.target.value;
        window.appState.saveSnapshot();
        window.dispatchEvent(new CustomEvent('state-changed'));
      });
      document.getElementById('iface-mac').addEventListener('change', (e) => {
        iface.mac = e.target.value;
        window.appState.saveSnapshot();
      });
    };

    updateInterfaceBox();

    // Add / Delete interface event listeners
    document.getElementById('btn-add-interface').addEventListener('click', () => {
      const res = window.appState.addNodeInterface(id, {});
      if (res && res.key) {
        this.currentIfaceKey = res.key;
        this.renderNodeInspector(id);
      }
    });

    document.getElementById('btn-remove-interface').addEventListener('click', () => {
      const keys = Object.keys(node.interfaces);
      if (keys.length <= 1) {
        alert('Device node must keep at least one active interface!');
        return;
      }
      window.appState.removeNodeInterface(id, this.currentIfaceKey);
      this.currentIfaceKey = Object.keys(node.interfaces)[0];
      this.renderNodeInspector(id);
    });

    // Dropdown change listener to switch active interface editor
    document.getElementById('prop-interface-select').addEventListener('change', (e) => {
      this.currentIfaceKey = e.target.value;
      updateInterfaceBox();
    });

    // General property change listeners
    document.getElementById('prop-hostname').addEventListener('change', (e) => {
      window.appState.updateNode(id, { hostname: e.target.value });
    });
    document.getElementById('prop-site').addEventListener('change', (e) => {
      const siteVal = e.target.value;
      if (siteVal === '__create_new__') {
        const modal = document.getElementById('modal-site-manager');
        if (modal) modal.classList.remove('hidden');
        this.renderNodeInspector(id);
        return;
      }
      window.appState.updateNode(id, { site: siteVal });
    });
    document.getElementById('prop-status').addEventListener('change', (e) => {
      window.appState.updateNode(id, { status: e.target.value });
    });
    document.getElementById('prop-ip').addEventListener('change', (e) => {
      window.appState.updateNode(id, { ip: e.target.value });
    });
    document.getElementById('prop-gateway').addEventListener('change', (e) => {
      window.appState.updateNode(id, { gateway: e.target.value });
    });
    document.getElementById('btn-delete-node').addEventListener('click', () => {
      window.appState.removeNode(id);
    });
  }

  renderCableInspector(id) {
    const cable = window.appState.getCableById(id);
    if (!cable) return;

    const source = window.appState.getNodeById(cable.sourceId);
    const target = window.appState.getNodeById(cable.targetId);

    this.badge.textContent = 'Cable Link';

    this.content.innerHTML = `
      <div class="inspector-group">
        <div class="group-title">Link Connection Points</div>
        <div class="prop-row">
          <label class="prop-label">Source Host</label>
          <input type="text" class="prop-input" value="${source ? source.hostname + ' (' + (cable.sourceSide || 'port').toUpperCase() + ')' : 'Unknown'}" readonly>
        </div>
        <div class="prop-row">
          <label class="prop-label">Target Host</label>
          <input type="text" class="prop-input" value="${target ? target.hostname + ' (' + (cable.targetSide || 'port').toUpperCase() + ')' : 'Unknown'}" readonly>
        </div>
      </div>

      <div class="inspector-group">
        <div class="group-title">Media Specification</div>
        <div class="prop-row">
          <label class="prop-label">Cable Media Type</label>
          <select id="prop-media-type" class="prop-input">
            <option value="cat6" ${cable.mediaType === 'cat6' ? 'selected' : ''}>Cat6 Ethernet (Copper)</option>
            <option value="fiber" ${cable.mediaType === 'fiber' ? 'selected' : ''}>Fiber Optic (100G SFP+)</option>
            <option value="wireless" ${cable.mediaType === 'wireless' ? 'selected' : ''}>Wireless / 5G Link</option>
            <option value="vpn" ${cable.mediaType === 'vpn' ? 'selected' : ''}>VPN Encrypted Tunnel</option>
          </select>
        </div>
        <div class="prop-row">
          <label class="prop-label">Routing Path Style</label>
          <select id="prop-cable-style" class="prop-input">
            <option value="bezier" ${cable.style === 'bezier' ? 'selected' : ''}>Curved (Bezier)</option>
            <option value="orthogonal" ${cable.style === 'orthogonal' ? 'selected' : ''}>Right-Angle (Orthogonal)</option>
            <option value="straight" ${cable.style === 'straight' ? 'selected' : ''}>Direct Straight</option>
          </select>
        </div>
        <div class="prop-row">
          <label class="prop-label">Max Bandwidth</label>
          <input type="text" id="prop-bandwidth" class="prop-input" value="${cable.bandwidth}">
        </div>
        <div class="prop-row">
          <label class="prop-label">Link Latency</label>
          <input type="text" id="prop-latency" class="prop-input" value="${cable.latency}">
        </div>
      </div>

      <button id="btn-delete-cable" class="btn secondary" style="color: var(--accent-red); margin-top: 10px;">Disconnect Cable</button>
    `;

    document.getElementById('prop-media-type').addEventListener('change', (e) => {
      cable.mediaType = e.target.value;
      window.appState.saveSnapshot();
      window.dispatchEvent(new CustomEvent('state-changed'));
    });
    document.getElementById('prop-cable-style').addEventListener('change', (e) => {
      cable.style = e.target.value;
      window.appState.saveSnapshot();
      window.dispatchEvent(new CustomEvent('state-changed'));
    });
    document.getElementById('prop-bandwidth').addEventListener('change', (e) => {
      cable.bandwidth = e.target.value;
      window.appState.saveSnapshot();
    });
    document.getElementById('prop-latency').addEventListener('change', (e) => {
      cable.latency = e.target.value;
      window.appState.saveSnapshot();
    });
    document.getElementById('btn-delete-cable').addEventListener('click', () => {
      window.appState.removeCable(id);
    });
  }
}

window.initInspector = function() {
  window.inspectorPanel = new InspectorPanel();
};
