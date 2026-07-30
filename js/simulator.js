/* NetForge Studio - Packet Traffic Simulator & Diagnostic Tracer */

class TrafficSimulator {
  constructor() {
    this.modal = document.getElementById('modal-simulator');
    this.sourceSelect = document.getElementById('sim-source-node');
    this.targetSelect = document.getElementById('sim-target-node');
    this.protocolSelect = document.getElementById('sim-protocol');
    this.logConsole = document.getElementById('sim-log-console');
    this.particlesGroup = document.getElementById('svg-particles-group');

    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('btn-simulate').addEventListener('click', () => {
      this.openModal();
    });

    document.getElementById('btn-close-simulator').addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('btn-start-sim-run').addEventListener('click', () => {
      this.runSimulation();
    });
  }

  openModal() {
    this.populateSelects();
    this.modal.classList.remove('hidden');
  }

  closeModal() {
    this.modal.classList.add('hidden');
  }

  populateSelects() {
    this.sourceSelect.innerHTML = '';
    this.targetSelect.innerHTML = '';

    window.appState.nodes.forEach(n => {
      const opt1 = document.createElement('option');
      opt1.value = n.id;
      opt1.textContent = `${n.hostname} (${n.ip})`;

      const opt2 = opt1.cloneNode(true);

      this.sourceSelect.appendChild(opt1);
      this.targetSelect.appendChild(opt2);
    });

    if (this.targetSelect.options.length > 1) {
      this.targetSelect.selectedIndex = 1;
    }
  }

  // Breadth-First Search (BFS) for finding shortest cable route path between source and target node
  findPath(sourceId, targetId) {
    if (sourceId === targetId) return [sourceId];

    const queue = [[sourceId]];
    const visited = new Set([sourceId]);

    while (queue.length > 0) {
      const path = queue.shift();
      const curr = path[path.length - 1];

      // Find neighbors connected by cables
      const cables = window.appState.cables.filter(c => c.sourceId === curr || c.targetId === curr);
      for (const cable of cables) {
        const neighbor = cable.sourceId === curr ? cable.targetId : cable.sourceId;
        if (neighbor === targetId) {
          return [...path, neighbor];
        }
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    return null; // No route path found
  }

  runSimulation() {
    const srcId = this.sourceSelect.value;
    const dstId = this.targetSelect.value;
    const proto = this.protocolSelect.value.toUpperCase();

    const srcNode = window.appState.getNodeById(srcId);
    const dstNode = window.appState.getNodeById(dstId);

    if (!srcNode || !dstNode) return;

    this.logConsole.innerHTML = '';
    this.log(`Initiating ${proto} diagnostic traceroute from ${srcNode.hostname} [${srcNode.ip}] to ${dstNode.hostname} [${dstNode.ip}]...`, 'info');

    const path = this.findPath(srcId, dstId);
    if (!path) {
      this.log(`[ERR] Destination host ${dstNode.hostname} is unreachable! No physical or logical link path exists.`, 'error');
      this.log(`Packet Loss: 100% (ICMP Request Timed Out)`, 'error');
      return;
    }

    // Step by step hop animation
    let hop = 0;
    this.log(`Routing path resolved: ${path.map(id => window.appState.getNodeById(id).hostname).join(' ➔ ')}`, 'success');

    const animateHop = () => {
      if (hop >= path.length - 1) {
        this.log(`[SUCCESS] 4 packets transmitted, 4 received, 0% packet loss. Round-trip min/avg/max = 0.8/1.4/2.1 ms`, 'success');
        return;
      }

      const currentHopNode = window.appState.getNodeById(path[hop]);
      const nextHopNode = window.appState.getNodeById(path[hop + 1]);

      const cable = window.appState.cables.find(c => 
        (c.sourceId === currentHopNode.id && c.targetId === nextHopNode.id) ||
        (c.sourceId === nextHopNode.id && c.targetId === currentHopNode.id)
      );

      this.log(`Hop ${hop + 1}: ${currentHopNode.hostname} ➔ ${nextHopNode.hostname} via ${cable ? cable.mediaType.toUpperCase() : 'LINK'} [Latency: <1ms]`, 'info');

      this.spawnPulseParticle(currentHopNode, nextHopNode, proto.toLowerCase());

      hop++;
      setTimeout(animateHop, 600);
    };

    setTimeout(animateHop, 400);
  }

  log(msg, type = 'info') {
    const div = document.createElement('div');
    div.className = `log-line ${type}`;
    div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    this.logConsole.appendChild(div);
    this.logConsole.scrollTop = this.logConsole.scrollHeight;
  }

  // Animate glowing dot traveling along SVG cable
  spawnPulseParticle(sNode, tNode, proto) {
    const p1 = window.CableRenderer.getNodePortCoords(sNode, 'right');
    const p2 = window.CableRenderer.getNodePortCoords(tNode, 'left');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', '6');
    circle.setAttribute('class', `packet-pulse-dot ${proto}`);
    circle.setAttribute('cx', p1.x);
    circle.setAttribute('cy', p1.y);

    this.particlesGroup.appendChild(circle);

    const startTime = performance.now();
    const duration = 500; // ms

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      const cx = p1.x + (p2.x - p1.x) * progress;
      const cy = p1.y + (p2.y - p1.y) * progress;

      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);

      if (progress < 1.0) {
        requestAnimationFrame(animate);
      } else {
        circle.remove();
      }
    };

    requestAnimationFrame(animate);
  }
}

window.initSimulator = function() {
  window.trafficSimulator = new TrafficSimulator();
};
