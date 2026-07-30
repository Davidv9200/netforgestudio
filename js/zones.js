/* NetForge Studio - Subnet & VLAN Zones Container Manager */

window.ZoneRenderer = {
  
  renderZones: function(zonesGroupSvg, zones, selectedId) {
    zonesGroupSvg.innerHTML = '';

    zones.forEach(zone => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('data-zone-id', zone.id);

      // Rectangle container
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', zone.x);
      rect.setAttribute('y', zone.y);
      rect.setAttribute('width', zone.width);
      rect.setAttribute('height', zone.height);
      rect.setAttribute('class', `subnet-zone-rect ${selectedId === zone.id ? 'selected' : ''}`);
      rect.setAttribute('stroke', zone.color || '#3b82f6');
      rect.setAttribute('fill', zone.color || '#3b82f6');

      // Title & CIDR Subnet Label Header
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', zone.x + 14);
      label.setAttribute('y', zone.y + 24);
      label.setAttribute('class', 'zone-label-text');
      label.textContent = zone.name;

      const cidr = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      cidr.setAttribute('x', zone.x + 14);
      cidr.setAttribute('y', zone.y + 40);
      cidr.setAttribute('class', 'zone-cidr-text');
      cidr.textContent = zone.cidr;

      g.appendChild(rect);
      g.appendChild(label);
      g.appendChild(cidr);

      // Click event for selecting zone
      rect.addEventListener('click', (e) => {
        e.stopPropagation();
        window.appState.selectItem(zone.id, 'zone');
      });

      zonesGroupSvg.appendChild(g);
    });
  }
};
