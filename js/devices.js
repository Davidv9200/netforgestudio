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
      iconSvg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 20h16M20 12v16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M15 17l-3 3 3 3M25 17l3 3-3 3M17 15l3-3 3 3M17 25l3 3 3-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    switch_l3: {
      type: 'switch_l3',
      name: 'L3 Core Switch',
      category: 'network',
      accentColor: '#06b6d4',
      ports: ['TenGig0/1', 'TenGig0/2', 'TenGig0/3', 'TenGig0/4', 'Gi1/0/1', 'Gi1/0/2', 'Gi1/0/3', 'Gi1/0/4'],
      defaultIp: '10.0.0.2',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><rect x="5" y="10" width="30" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M10 16h20M10 24h20" stroke="currentColor" stroke-width="2"/><path d="M15 13.5l-4 2.5 4 2.5M25 21.5l4 2.5-4 2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    switch_l2: {
      type: 'switch_l2',
      name: 'L2 Access Switch',
      category: 'network',
      accentColor: '#0ea5e9',
      ports: ['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4', 'Fa0/5', 'Gi0/1'],
      defaultIp: '192.168.1.2',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><rect x="5" y="12" width="30" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="9" y="16" width="4" height="4" rx="1" fill="currentColor"/><rect x="15" y="16" width="4" height="4" rx="1" fill="currentColor"/><rect x="21" y="16" width="4" height="4" rx="1" fill="currentColor"/><rect x="27" y="16" width="4" height="4" rx="1" fill="currentColor"/><line x1="9" y1="23" x2="31" y2="23" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/></svg>`
    },
    firewall: {
      type: 'firewall',
      name: 'Next-Gen Firewall',
      category: 'network',
      accentColor: '#ef4444',
      ports: ['eth0/outside', 'eth0/inside', 'eth0/dmz'],
      defaultIp: '192.168.1.254',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><path d="M20 4L6 10v10c0 9 6 15 14 17 8-2 14-8 14-17V10L20 4z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 15h16M12 21h16M12 27h16M18 15v6M24 21v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
    },
    wireless_ap: {
      type: 'wireless_ap',
      name: 'Wireless AP',
      category: 'network',
      accentColor: '#a855f7',
      ports: ['eth0 (PoE)', 'wlan0'],
      defaultIp: '192.168.1.5',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="28" r="3.5" fill="currentColor"/><path d="M13 21a10 10 0 0114 0M8 15a17 17 0 0124 0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M20 28v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
    },
    internet_cloud: {
      type: 'internet_cloud',
      name: 'Internet Cloud',
      category: 'network',
      accentColor: '#38bdf8',
      ports: ['WAN0', 'WAN1'],
      defaultIp: '8.8.8.8',
      defaultMask: '0.0.0.0',
      iconSvg: `<svg viewBox="0 0 40 40"><path d="M10 28a6.5 6.5 0 01-1-12.9 8.5 8.5 0 0116.2-2.1A6.5 6.5 0 0131 28H10z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="20" cy="20" r="2" fill="currentColor"/></svg>`
    },
    server_web: {
      type: 'server_web',
      name: 'Web Server',
      category: 'server',
      accentColor: '#10b981',
      ports: ['eth0', 'eth1'],
      defaultIp: '192.168.1.100',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><rect x="7" y="6" width="26" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="7" y="23" width="26" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="13" cy="11.5" r="2" fill="currentColor"/><circle cx="13" cy="28.5" r="2" fill="currentColor"/><line x1="19" y1="11.5" x2="27" y2="11.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="19" y1="28.5" x2="27" y2="28.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
    },
    server_db: {
      type: 'server_db',
      name: 'Database Server',
      category: 'server',
      accentColor: '#f59e0b',
      ports: ['eth0'],
      defaultIp: '192.168.1.101',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><ellipse cx="20" cy="9" rx="13" ry="4.5" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M7 9v11c0 2.5 5.8 4.5 13 4.5s13-2 13-4.5V9M7 20v11c0 2.5 5.8 4.5 13 4.5s13-2 13-4.5V20" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="12" cy="14" r="1.5" fill="currentColor"/><circle cx="12" cy="25" r="1.5" fill="currentColor"/></svg>`
    },
    nas_storage: {
      type: 'nas_storage',
      name: 'NAS Storage',
      category: 'server',
      accentColor: '#84cc16',
      ports: ['bond0 (eth0+eth1)'],
      defaultIp: '192.168.1.150',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><rect x="6" y="7" width="28" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="6" y1="15" x2="34" y2="15" stroke="currentColor" stroke-width="2"/><line x1="6" y1="23" x2="34" y2="23" stroke="currentColor" stroke-width="2"/><circle cx="28" cy="11" r="1.8" fill="currentColor"/><circle cx="28" cy="19" r="1.8" fill="currentColor"/><circle cx="28" cy="27" r="1.8" fill="currentColor"/><rect x="10" y="10" width="10" height="2" rx="1" fill="currentColor"/><rect x="10" y="18" width="10" height="2" rx="1" fill="currentColor"/><rect x="10" y="26" width="10" height="2" rx="1" fill="currentColor"/></svg>`
    },
    pc_workstation: {
      type: 'pc_workstation',
      name: 'Desktop PC',
      category: 'endpoint',
      accentColor: '#ec4899',
      ports: ['Ethernet'],
      defaultIp: '192.168.1.20',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><rect x="5" y="7" width="22" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 24v4h8v-4M9 28h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="30" y="10" width="6" height="18" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="33" cy="14" r="1" fill="currentColor"/></svg>`
    },
    laptop: {
      type: 'laptop',
      name: 'Laptop PC',
      category: 'endpoint',
      accentColor: '#f43f5e',
      ports: ['Wi-Fi / Eth'],
      defaultIp: '192.168.1.21',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><rect x="9" y="9" width="22" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M4 29h32a2 2 0 002-2v-1H2v1a2 2 0 002 2z" fill="currentColor"/></svg>`
    },
    ip_phone: {
      type: 'ip_phone',
      name: 'IP Phone',
      category: 'endpoint',
      accentColor: '#a855f7',
      ports: ['SW Port', 'PC Port'],
      defaultIp: '192.168.1.80',
      defaultMask: '255.255.255.0',
      iconSvg: `<svg viewBox="0 0 40 40"><rect x="10" y="6" width="20" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="14" y="9" width="12" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="15" cy="21" r="1.2" fill="currentColor"/><circle cx="20" cy="21" r="1.2" fill="currentColor"/><circle cx="25" cy="21" r="1.2" fill="currentColor"/><circle cx="15" cy="26" r="1.2" fill="currentColor"/><circle cx="20" cy="26" r="1.2" fill="currentColor"/><circle cx="25" cy="26" r="1.2" fill="currentColor"/></svg>`
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
