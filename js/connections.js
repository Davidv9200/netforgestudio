/* NetForge Studio - Cable Connections & Path Rendering Engine */

window.CableRenderer = {

  // Calculate anchor point on a node given port side or interface key
  getNodePortCoords: function(node, sideOrKey = 'top', cableIndex = 0, totalOnSide = 1) {
    const hostnameText = node.hostname || node.name || '';
    const width = Math.max(84, hostnameText.length * 8.5 + 28);
    const height = 80;
    let x = node.x;
    let y = node.y;

    let side = sideOrKey;
    let idxOnSide = cableIndex;
    let total = totalOnSide;

    if (node.interfaces) {
      // Look up interface by key or name
      const ifaceEntry = Object.entries(node.interfaces).find(([k, v]) => k === sideOrKey || v.name === sideOrKey || (v.side || k) === sideOrKey);
      if (ifaceEntry) {
        const [k, iface] = ifaceEntry;
        side = iface.side || k;
        const sideList = Object.entries(node.interfaces).filter(([key, val]) => (val.side || key) === side);
        idxOnSide = sideList.findIndex(([key]) => key === k);
        if (idxOnSide === -1) idxOnSide = 0;
        total = Math.max(1, sideList.length);
      }
    }

    const validSide = ['top', 'bottom', 'left', 'right'].includes(side) ? side : 'top';
    const posVal = ['top', 'bottom'].includes(validSide)
      ? (idxOnSide + 1) * (width / (total + 1))
      : (idxOnSide + 1) * (height / (total + 1));

    switch (validSide) {
      case 'top':
        x += posVal;
        break;
      case 'bottom':
        x += posVal;
        y += height;
        break;
      case 'left':
        y += posVal;
        break;
      case 'right':
        x += width;
        y += posVal;
        break;
      default:
        x += width / 2;
        y += height / 2;
    }

    return { x, y };
  },

  // Calculate SVG Path string 'd' attribute based on cable style
  generatePathString: function(sourcePos, targetPos, style = 'bezier') {
    const x1 = sourcePos.x;
    const y1 = sourcePos.y;
    const x2 = targetPos.x;
    const y2 = targetPos.y;

    if (style === 'straight') {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    if (style === 'orthogonal') {
      const midX = x1 + (x2 - x1) / 2;

      // Check if default 3-segment orthogonal line passes through any device node box
      const nodes = (window.appState && window.appState.nodes) ? window.appState.nodes : [];
      let obstacleHit = false;
      let hitBox = null;

      for (const node of nodes) {
        const nLeft = node.x - 12;
        const nTop = node.y - 12;
        const nRight = node.x + 84;
        const nBottom = node.y + 84;

        // Ignore endpoint nodes
        if ((Math.abs(node.x - (x1 - 36)) < 50 && Math.abs(node.y - (y1 - 36)) < 50) ||
            (Math.abs(node.x - (x2 - 36)) < 50 && Math.abs(node.y - (y2 - 36)) < 50)) {
          continue;
        }

        // Check vertical segment collision (midX, y1) to (midX, y2)
        if (midX >= nLeft && midX <= nRight && Math.min(y1, y2) <= nBottom && Math.max(y1, y2) >= nTop) {
          obstacleHit = true;
          hitBox = { nLeft, nRight, nTop, nBottom };
          break;
        }
      }

      if (obstacleHit && hitBox) {
        // Detour around obstacle: route along outer edge of obstacle box
        const detourX = (x2 >= x1) ? hitBox.nRight + 24 : hitBox.nLeft - 24;
        return `M ${x1} ${y1} L ${detourX} ${y1} L ${detourX} ${y2} L ${x2} ${y2}`;
      }

      return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
    }

    // Bezier smooth curve
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const curveOffset = Math.max(40, Math.min(dx, dy) * 0.5);

    let cx1 = x1;
    let cy1 = y1;
    let cx2 = x2;
    let cy2 = y2;

    if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
      cx1 = x1 + (x2 > x1 ? curveOffset : -curveOffset);
      cx2 = x2 + (x2 > x1 ? -curveOffset : curveOffset);
    } else {
      cy1 = y1 + (y2 > y1 ? curveOffset : -curveOffset);
      cy2 = y2 + (y2 > y1 ? -curveOffset : curveOffset);
    }

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  },

  // Render all cables into SVG container
  renderCables: function(cablesGroupSvg, cables, nodes, selectedId) {
    cablesGroupSvg.innerHTML = '';

    cables.forEach(cable => {
      const sourceNode = nodes.find(n => n.id === cable.sourceId);
      const targetNode = nodes.find(n => n.id === cable.targetId);

      if (!sourceNode || !targetNode) return;

      let sSide = cable.sourceSide || 'right';
      let tSide = cable.targetSide || 'left';

      const p1 = this.getNodePortCoords(sourceNode, sSide);
      const p2 = this.getNodePortCoords(targetNode, tSide);

      const pathData = this.generatePathString(p1, p2, cable.style || 'bezier');

      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('d', pathData);
      pathEl.setAttribute('class', `cable-path ${cable.mediaType} ${selectedId === cable.id ? 'selected' : ''}`);
      pathEl.setAttribute('data-cable-id', cable.id);

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.appendChild(pathEl);

      // Port labels near endpoints pushed OUTSIDE device node frame
      const createPortLabel = (coords, side, textStr) => {
        let lx = coords.x;
        let ly = coords.y;
        let anchor = 'middle';

        if (side === 'top') {
          ly = coords.y - 14;
          anchor = 'middle';
        } else if (side === 'bottom') {
          ly = coords.y + 20;
          anchor = 'middle';
        } else if (side === 'left') {
          lx = coords.x - 14;
          ly = coords.y + 4;
          anchor = 'end';
        } else if (side === 'right') {
          lx = coords.x + 14;
          ly = coords.y + 4;
          anchor = 'start';
        }

        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.setAttribute('x', lx);
        textEl.setAttribute('y', ly);
        textEl.setAttribute('text-anchor', anchor);
        textEl.setAttribute('class', 'cable-port-label');
        textEl.textContent = textStr;
        return textEl;
      };

      g.appendChild(createPortLabel(p1, sSide, cable.sourcePort));
      g.appendChild(createPortLabel(p2, tSide, cable.targetPort));

      // Derive VLAN tag for source interface & target interface
      const findIface = (node, portName, side) => {
        if (!node || !node.interfaces) return null;
        let found = Object.values(node.interfaces).find(i => i.name === portName);
        if (found) return found;
        if (node.interfaces[portName]) return node.interfaces[portName];
        if (node.interfaces[side]) return node.interfaces[side];
        found = Object.values(node.interfaces).find(i => i.side === side);
        return found || null;
      };

      const sIface = findIface(sourceNode, cable.sourcePort, sSide);
      const tIface = findIface(targetNode, cable.targetPort, tSide);

      const sVlan = sIface?.vlan || sourceNode.assignedVlan || 'VLAN 10';
      const tVlan = tIface?.vlan || targetNode.assignedVlan || 'VLAN 10';

      let vlanLabelText = '';
      let isTrunkLink = false;

      if (sIface?.mode === 'Trunk' || tIface?.mode === 'Trunk') {
        isTrunkLink = true;
        const trunkInfo = sIface?.mode === 'Trunk' ? (sIface.vlan || 'Trunk') : (tIface?.vlan || 'Trunk');
        vlanLabelText = trunkInfo.startsWith('Trunk') ? trunkInfo : `Trunk (${trunkInfo})`;
      } else if (sVlan === tVlan) {
        vlanLabelText = sVlan;
      } else {
        vlanLabelText = `${sVlan} ↔ ${tVlan}`;
      }

      // Midpoint VLAN Tag Badge on Cable
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;

      const tagGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      tagGroup.setAttribute('class', `cable-vlan-tag ${isTrunkLink ? 'trunk-link' : ''}`);
      
      const badgeW = Math.max(68, vlanLabelText.length * 7.5 + 28);
      const badgeH = 22;
      const bx = mx - badgeW / 2;
      const by = my - badgeH / 2;

      const bgColor = '#0f172a';
      const strokeColor = isTrunkLink ? '#c084fc' : '#38bdf8';
      const textColor = isTrunkLink ? '#e9d5ff' : '#ffffff';
      const icon = isTrunkLink ? '🔀 ' : '🏷️ ';

      const tagRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      tagRect.setAttribute('x', bx);
      tagRect.setAttribute('y', by);
      tagRect.setAttribute('width', badgeW);
      tagRect.setAttribute('height', badgeH);
      tagRect.setAttribute('rx', '6');
      tagRect.setAttribute('fill', bgColor);
      tagRect.setAttribute('stroke', strokeColor);
      tagRect.setAttribute('stroke-width', '2');
      tagGroup.appendChild(tagRect);

      const tagText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tagText.setAttribute('x', mx);
      tagText.setAttribute('y', my + 4);
      tagText.setAttribute('text-anchor', 'middle');
      tagText.setAttribute('fill', textColor);
      tagText.setAttribute('font-size', '11');
      tagText.setAttribute('font-weight', '700');
      tagText.setAttribute('font-family', 'Inter, system-ui, sans-serif');
      tagText.textContent = `${icon}${vlanLabelText}`;
      tagGroup.appendChild(tagText);

      if (!window.appState || window.appState.showVlanBadges !== false) {
        g.appendChild(tagGroup);
      }

      pathEl.addEventListener('click', (e) => {
        e.stopPropagation();
        window.appState.selectItem(cable.id, 'cable');
      });

      cablesGroupSvg.appendChild(g);
    });
  }
};
