/* NetForge Studio - File Exporter, Image Snapshot & BOM Generator */

window.ExportManager = {

  // Export topology state to JSON file download
  exportJson: function() {
    const data = {
      appName: 'NetForge Studio',
      version: '2.4 Pro',
      timestamp: new Date().toISOString(),
      nodes: window.appState.nodes,
      cables: window.appState.cables,
      availableSites: window.appState.availableSites,
      siteRegions: window.appState.siteRegions
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `network_topology_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Load topology state from JSON file input
  importJson: function(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.nodes && data.cables) {
          window.appState.loadTopology(data);
        } else {
          alert('Invalid topology file format!');
        }
      } catch (err) {
        alert('Failed to parse JSON topology file!');
      }
    };
    reader.readAsText(file);
  },

  // Export scalable SVG vector string download
  exportSvg: function() {
    const svgLayer = document.getElementById('canvas-svg');
    const svgClone = svgLayer.cloneNode(true);
    
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('width', '1600');
    svgClone.setAttribute('height', '1000');

    const svgStr = new XMLSerializer().serializeToString(svgClone);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `network_diagram_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Export high-resolution PNG image screenshot
  exportPng: function() {
    const canvasContainer = document.getElementById('canvas-container');
    const svgLayer = document.getElementById('canvas-svg');

    // Create offscreen canvas for rendering combined SVG + HTML nodes
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    // Dark background fill
    ctx.fillStyle = '#070a11';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render Grid dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let x = 0; x < canvas.width; x += 24) {
      for (let y = 0; y < canvas.height; y += 24) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    // Convert SVG layer to image
    const svgData = new XMLSerializer().serializeToString(svgLayer);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      ctx.drawImage(img, 0, 0);

      // Render HTML Nodes onto canvas
      window.appState.nodes.forEach(node => {
        const def = window.DeviceRegistry.getDeviceDef(node.type);

        // Draw node box
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = node.accentColor || '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(node.x, node.y, 72, 72, 12);
        ctx.fill();
        ctx.stroke();

        // Draw Hostname & IP text
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(node.hostname, node.x + 36, node.y + 90);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '11px JetBrains Mono';
        ctx.fillText(node.ip, node.x + 36, node.y + 106);
      });

      URL.revokeObjectURL(url);

      // Trigger download
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `network_diagram_${Date.now()}.png`;
      a.click();
    };

    img.src = url;
  },

  // Populate Bill of Materials & IP Inventory Modal
  generateBomReport: function() {
    const nodeTbody = document.querySelector('#table-bom-devices tbody');
    const cableTbody = document.querySelector('#table-bom-cables tbody');

    nodeTbody.innerHTML = '';
    cableTbody.innerHTML = '';

    window.appState.nodes.forEach(n => {
      const siteStr = n.site || 'Site A (HQ)';
      if (n.interfaces) {
        Object.keys(n.interfaces).forEach(ifaceKey => {
          const iface = n.interfaces[ifaceKey];
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong>${n.hostname}</strong> (${iface.name})</td>
            <td><span style="color: #38bdf8; font-weight: 500;">📍 ${siteStr}</span></td>
            <td>${n.name}</td>
            <td>${iface.ip}</td>
            <td>${iface.mask}</td>
            <td>${iface.vlan || 'VLAN 1'}</td>
            <td>${iface.mac}</td>
            <td><span style="color: ${iface.status === 'down' ? '#ef4444' : '#10b981'}; font-weight: 600;">${(iface.status || 'up').toUpperCase()} (${iface.mode || 'Access'})</span></td>
          `;
          nodeTbody.appendChild(tr);
        });
      } else {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${n.hostname}</strong></td>
          <td><span style="color: #38bdf8; font-weight: 500;">📍 ${siteStr}</span></td>
          <td>${n.name}</td>
          <td>${n.ip}</td>
          <td>${n.mask}</td>
          <td>${n.assignedVlan || 'VLAN 1'}</td>
          <td>${n.mac}</td>
          <td><span style="color: ${n.status === 'offline' ? '#ef4444' : '#10b981'}; font-weight: 600;">${(n.status || 'online').toUpperCase()}</span></td>
        `;
        nodeTbody.appendChild(tr);
      }
    });

    window.appState.cables.forEach(c => {
      const sNode = window.appState.getNodeById(c.sourceId);
      const tNode = window.appState.getNodeById(c.targetId);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${sNode ? sNode.hostname : 'N/A'} (${c.sourceSide || c.sourcePort})</td>
        <td>${tNode ? tNode.hostname : 'N/A'} (${c.targetSide || c.targetPort})</td>
        <td><span style="text-transform: uppercase; font-weight: 600;">${c.mediaType}</span></td>
        <td>${c.bandwidth}</td>
        <td><span style="color: #10b981; font-weight: 600;">LINK UP</span></td>
      `;
      cableTbody.appendChild(tr);
    });

    // Populate VLAN breakdown table
    const vlanTbody = document.querySelector('#table-bom-vlans tbody');
    if (vlanTbody) {
      vlanTbody.innerHTML = '';
      const vlanMap = {};

      window.appState.nodes.forEach(n => {
        if (n.interfaces) {
          Object.values(n.interfaces).forEach(iface => {
            const vlanTag = iface.vlan || 'VLAN 1';
            if (!vlanMap[vlanTag]) vlanMap[vlanTag] = { members: [], modes: new Set() };
            vlanMap[vlanTag].members.push(`${n.hostname} (${iface.name})`);
            vlanMap[vlanTag].modes.add(iface.mode || 'Access');
          });
        }
      });

      Object.entries(vlanMap).forEach(([vlanTag, data]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong style="color: #38bdf8;">🏷️ ${vlanTag}</strong></td>
          <td>${data.members.join(', ')}</td>
          <td>${Array.from(data.modes).join(', ')}</td>
          <td><strong>${data.members.length}</strong> Ports</td>
        `;
        vlanTbody.appendChild(tr);
      });
    }
  }
};
