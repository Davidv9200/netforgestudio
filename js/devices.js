/* NetForge Studio - Device Definitions & Icon Registry */

window.DeviceRegistry = {
  // Device definitions dictionary
  devices: {
    router: {
      type: 'router',
      name: 'Edge Router',
      category: 'network',
      accentColor: '#3b82f6',
      ports: ['GigabitEthernet0/0', 'GigabitEthernet0/1', 'GigabitEthernet0/2', 'Serial0/0/0'],
      defaultIp: '192.168.1.1',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 20h16M20 12v16M14 14l12 12M14 26l12-12" stroke="currentColor" stroke-width="2"/></svg>`
    },
    switch_l3: {
      type: 'switch_l3',
      name: 'L3 Core Switch',
      category: 'network',
      accentColor: '#06b6d4',
      ports: ['TenGig0/1', 'TenGig0/2', 'TenGig0/3', 'TenGig0/4', 'Gi1/0/1', 'Gi1/0/2', 'Gi1/0/3', 'Gi1/0/4'],
      defaultIp: '10.0.0.2',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><rect x="6" y="10" width="28" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 16h16M12 24h16M16 13l-4 3 4 3M24 21l4 3-4 3" stroke="currentColor" stroke-width="2"/></svg>`
    },
    switch_l2: {
      type: 'switch_l2',
      name: 'L2 Access Switch',
      category: 'network',
      accentColor: '#0ea5e9',
      ports: ['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4', 'Fa0/5', 'Gi0/1'],
      defaultIp: '192.168.1.2',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><rect x="6" y="12" width="28" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="12" cy="20" r="2" fill="currentColor"/><circle cx="20" cy="20" r="2" fill="currentColor"/><circle cx="28" cy="20" r="2" fill="currentColor"/></svg>`
    },
    firewall: {
      type: 'firewall',
      name: 'Next-Gen Firewall',
      category: 'network',
      accentColor: '#ef4444',
      ports: ['eth0/outside', 'eth0/inside', 'eth0/dmz'],
      defaultIp: '192.168.1.254',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><path d="M20 4L6 10v10c0 9 6 15 14 17 8-2 14-8 14-17V10L20 4z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M13 16h14M13 22h14M20 16v12" stroke="currentColor" stroke-width="1.8"/></svg>`
    },
    wireless_ap: {
      type: 'wireless_ap',
      name: 'Wireless AP',
      category: 'network',
      accentColor: '#8b5cf6',
      ports: ['eth0 (PoE)', 'wlan0'],
      defaultIp: '192.168.1.5',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="26" r="3" fill="currentColor"/><path d="M12 18a11 11 0 0116 0M8 13a17 17 0 0124 0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`
    },
    internet_cloud: {
      type: 'internet_cloud',
      name: 'Internet Cloud',
      category: 'network',
      accentColor: '#38bdf8',
      ports: ['WAN0', 'WAN1'],
      defaultIp: '8.8.8.8',
      defaultMask: '0.0.0.0',
      iconSvg: `<svg viewBox="0 0 40 40"><path d="M10 26a7 7 0 01-1-14 9 9 0 0117-2 7 7 0 015 16H10z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`
    },
    server_web: {
      type: 'server_web',
      name: 'Web Server',
      category: 'server',
      accentColor: '#10b981',
      ports: ['eth0', 'eth1'],
      defaultIp: '192.168.1.100',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><rect x="8" y="6" width="24" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="8" y="24" width="24" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="8" y1="20" x2="32" y2="20" stroke="currentColor" stroke-width="2"/><circle cx="14" cy="11" r="1.5" fill="currentColor"/><circle cx="14" cy="29" r="1.5" fill="currentColor"/></svg>`
    },
    server_db: {
      type: 'server_db',
      name: 'Database Server',
      category: 'server',
      accentColor: '#f59e0b',
      ports: ['eth0'],
      defaultIp: '192.168.1.101',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><ellipse cx="20" cy="10" rx="12" ry="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 10v10c0 2.2 5.4 4 12 4s12-1.8 12-4V10M8 20v10c0 2.2 5.4 4 12 4s12-1.8 12-4V20" fill="none" stroke="currentColor" stroke-width="2"/></svg>`
    },
    nas_storage: {
      type: 'nas_storage',
      name: 'NAS Storage',
      category: 'server',
      accentColor: '#84cc16',
      ports: ['bond0 (eth0+eth1)'],
      defaultIp: '192.168.1.150',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><rect x="6" y="8" width="28" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><line x1="6" y1="16" x2="34" y2="16" stroke="currentColor" stroke-width="1.8"/><line x1="6" y1="24" x2="34" y2="24" stroke="currentColor" stroke-width="1.8"/><circle cx="30" cy="12" r="1.5" fill="currentColor"/><circle cx="30" cy="20" r="1.5" fill="currentColor"/><circle cx="30" cy="28" r="1.5" fill="currentColor"/></svg>`
    },
    pc_workstation: {
      type: 'pc_workstation',
      name: 'Desktop PC',
      category: 'endpoint',
      accentColor: '#ec4899',
      ports: ['Ethernet'],
      defaultIp: '192.168.1.20',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><rect x="6" y="8" width="28" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 26v4h12v-4M10 30h20" stroke="currentColor" stroke-width="2"/></svg>`
    },
    laptop: {
      type: 'laptop',
      name: 'Laptop PC',
      category: 'endpoint',
      accentColor: '#f43f5e',
      ports: ['Wi-Fi / Eth'],
      defaultIp: '192.168.1.21',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><rect x="10" y="10" width="20" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 27h32a2 2 0 002-2v-1H2v1a2 2 0 002 2z" fill="currentColor"/></svg>`
    },
    ip_phone: {
      type: 'ip_phone',
      name: 'IP Phone',
      category: 'endpoint',
      accentColor: '#a855f7',
      ports: ['SW Port', 'PC Port'],
      defaultIp: '192.168.1.80',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><rect x="12" y="6" width="16" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><rect x="15" y="9" width="10" height="7" rx="1" fill="currentColor" opacity="0.3"/><circle cx="16" cy="20" r="1" fill="currentColor"/><circle cx="20" cy="20" r="1" fill="currentColor"/><circle cx="24" cy="20" r="1" fill="currentColor"/></svg>`
    }
  },

  getDeviceDef: function(type) {
    return this.devices[type] || this.devices['pc_workstation'];
  },

  generateRandomMac: function() {
    const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
    return `02:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
  }
};
