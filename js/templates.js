/* NetForge Studio - Pre-Built Network Topology Templates */

window.TemplateRegistry = {
  templates: {
    enterprise_dmz: {
      name: 'Enterprise Dual-Homed DMZ',
      nodes: [
        { id: 'cloud_1', type: 'internet_cloud', hostname: 'ISP-Cloud', ip: '8.8.8.8', mask: '0.0.0.0', x: 420, y: 40 },
        { id: 'fw_1', type: 'firewall', hostname: 'Perimeter-FW1', ip: '192.168.1.254', mask: '255.255.255.0', x: 280, y: 160 },
        { id: 'fw_2', type: 'firewall', hostname: 'Perimeter-FW2', ip: '192.168.1.253', mask: '255.255.255.0', x: 560, y: 160 },
        { id: 'sw_core', type: 'switch_l3', hostname: 'Core-L3-Switch', ip: '10.0.0.1', mask: '255.255.255.0', x: 420, y: 300 },
        { id: 'web_1', type: 'server_web', hostname: 'DMZ-WebServer-01', ip: '172.16.10.10', mask: '255.255.255.0', x: 160, y: 440 },
        { id: 'web_2', type: 'server_web', hostname: 'DMZ-WebServer-02', ip: '172.16.10.11', mask: '255.255.255.0', x: 340, y: 440 },
        { id: 'db_1', type: 'server_db', hostname: 'Internal-DB01', ip: '10.0.10.50', mask: '255.255.255.0', x: 520, y: 440 },
        { id: 'pc_1', type: 'pc_workstation', hostname: 'Admin-Workstation', ip: '10.0.20.15', mask: '255.255.255.0', x: 700, y: 440 }
      ],
      cables: [
        { id: 'c1', sourceId: 'cloud_1', targetId: 'fw_1', sourcePort: 'WAN0', targetPort: 'eth0/outside', mediaType: 'fiber', style: 'bezier' },
        { id: 'c2', sourceId: 'cloud_1', targetId: 'fw_2', sourcePort: 'WAN1', targetPort: 'eth0/outside', mediaType: 'fiber', style: 'bezier' },
        { id: 'c3', sourceId: 'fw_1', targetId: 'sw_core', sourcePort: 'eth0/inside', targetPort: 'TenGig0/1', mediaType: 'cat6', style: 'bezier' },
        { id: 'c4', sourceId: 'fw_2', targetId: 'sw_core', sourcePort: 'eth0/inside', targetPort: 'TenGig0/2', mediaType: 'cat6', style: 'bezier' },
        { id: 'c5', sourceId: 'sw_core', targetId: 'web_1', sourcePort: 'Gi1/0/1', targetPort: 'eth0', mediaType: 'cat6', style: 'orthogonal' },
        { id: 'c6', sourceId: 'sw_core', targetId: 'web_2', sourcePort: 'Gi1/0/2', targetPort: 'eth0', mediaType: 'cat6', style: 'orthogonal' },
        { id: 'c7', sourceId: 'sw_core', targetId: 'db_1', sourcePort: 'Gi1/0/3', targetPort: 'eth0', mediaType: 'cat6', style: 'orthogonal' },
        { id: 'c8', sourceId: 'sw_core', targetId: 'pc_1', sourcePort: 'Gi1/0/4', targetPort: 'Ethernet', mediaType: 'cat6', style: 'orthogonal' }
      ],
      zones: [
        { id: 'z1', name: 'DMZ Public Subnet', cidr: '172.16.10.0/24', x: 120, y: 400, width: 340, height: 160, color: '#ef4444' },
        { id: 'z2', name: 'Internal LAN Subnet', cidr: '10.0.0.0/16', x: 480, y: 400, width: 340, height: 160, color: '#3b82f6' }
      ]
    },

    spine_leaf: {
      name: 'Datacenter Spine-Leaf',
      nodes: [
        { id: 'spine_1', type: 'switch_l3', hostname: 'Spine-Switch-01', ip: '10.255.0.1', mask: '255.255.255.0', x: 260, y: 80 },
        { id: 'spine_2', type: 'switch_l3', hostname: 'Spine-Switch-02', ip: '10.255.0.2', mask: '255.255.255.0', x: 540, y: 80 },
        { id: 'leaf_1', type: 'switch_l2', hostname: 'Leaf-Switch-01', ip: '10.255.1.1', mask: '255.255.255.0', x: 160, y: 240 },
        { id: 'leaf_2', type: 'switch_l2', hostname: 'Leaf-Switch-02', ip: '10.255.1.2', mask: '255.255.255.0', x: 380, y: 240 },
        { id: 'leaf_3', type: 'switch_l2', hostname: 'Leaf-Switch-03', ip: '10.255.1.3', mask: '255.255.255.0', x: 600, y: 240 },
        { id: 'srv_1', type: 'server_web', hostname: 'Compute-Node-01', ip: '10.100.1.10', mask: '255.255.255.0', x: 120, y: 400 },
        { id: 'srv_2', type: 'server_db', hostname: 'Compute-Node-02', ip: '10.100.1.11', mask: '255.255.255.0', x: 280, y: 400 },
        { id: 'nas_1', type: 'nas_storage', hostname: 'SAN-Storage-Array', ip: '10.100.2.50', mask: '255.255.255.0', x: 540, y: 400 }
      ],
      cables: [
        { id: 'sl1', sourceId: 'spine_1', targetId: 'leaf_1', sourcePort: 'SFP+1', targetPort: 'Gi0/1', mediaType: 'fiber', style: 'straight' },
        { id: 'sl2', sourceId: 'spine_1', targetId: 'leaf_2', sourcePort: 'SFP+2', targetPort: 'Gi0/1', mediaType: 'fiber', style: 'straight' },
        { id: 'sl3', sourceId: 'spine_1', targetId: 'leaf_3', sourcePort: 'SFP+3', targetPort: 'Gi0/1', mediaType: 'fiber', style: 'straight' },
        { id: 'sl4', sourceId: 'spine_2', targetId: 'leaf_1', sourcePort: 'SFP+1', targetPort: 'Gi0/2', mediaType: 'fiber', style: 'straight' },
        { id: 'sl5', sourceId: 'spine_2', targetId: 'leaf_2', sourcePort: 'SFP+2', targetPort: 'Gi0/2', mediaType: 'fiber', style: 'straight' },
        { id: 'sl6', sourceId: 'spine_2', targetId: 'leaf_3', sourcePort: 'SFP+3', targetPort: 'Gi0/2', mediaType: 'fiber', style: 'straight' },
        { id: 'sl7', sourceId: 'leaf_1', targetId: 'srv_1', sourcePort: 'Fa0/1', targetPort: 'eth0', mediaType: 'cat6', style: 'orthogonal' },
        { id: 'sl8', sourceId: 'leaf_2', targetId: 'srv_2', sourcePort: 'Fa0/1', targetPort: 'eth0', mediaType: 'cat6', style: 'orthogonal' },
        { id: 'sl9', sourceId: 'leaf_3', targetId: 'nas_1', sourcePort: 'Fa0/1', targetPort: 'bond0', mediaType: 'fiber', style: 'orthogonal' }
      ],
      zones: [
        { id: 'z_dc', name: 'Data Center Fabric Zone', cidr: '10.100.0.0/16', x: 80, y: 360, width: 620, height: 160, color: '#10b981' }
      ]
    },

    branch_office: {
      name: 'Small Office / Home Network',
      nodes: [
        { id: 'cloud_b', type: 'internet_cloud', hostname: 'ISP-Broadband', ip: '203.0.113.1', mask: '255.255.255.0', x: 380, y: 60 },
        { id: 'gw_b', type: 'router', hostname: 'Branch-Gateway', ip: '192.168.1.1', mask: '255.255.255.0', x: 380, y: 180 },
        { id: 'sw_b', type: 'switch_l2', hostname: 'Office-Switch', ip: '192.168.1.2', mask: '255.255.255.0', x: 380, y: 300 },
        { id: 'ap_b', type: 'wireless_ap', hostname: 'Wi-Fi6-AP', ip: '192.168.1.5', mask: '255.255.255.0', x: 180, y: 420 },
        { id: 'phone_b', type: 'ip_phone', hostname: 'VoIP-Phone', ip: '192.168.1.80', mask: '255.255.255.0', x: 380, y: 420 },
        { id: 'pc_b', type: 'pc_workstation', hostname: 'Staff-PC01', ip: '192.168.1.20', mask: '255.255.255.0', x: 560, y: 420 },
        { id: 'laptop_b', type: 'laptop', hostname: 'CEO-Laptop', ip: '192.168.1.25', mask: '255.255.255.0', x: 60, y: 420 }
      ],
      cables: [
        { id: 'cb1', sourceId: 'cloud_b', targetId: 'gw_b', sourcePort: 'WAN0', targetPort: 'GigabitEthernet0/0', mediaType: 'cat6', style: 'bezier' },
        { id: 'cb2', sourceId: 'gw_b', targetId: 'sw_b', sourcePort: 'GigabitEthernet0/1', targetPort: 'Gi0/1', mediaType: 'cat6', style: 'bezier' },
        { id: 'cb3', sourceId: 'sw_b', targetId: 'ap_b', sourcePort: 'Fa0/1', targetPort: 'eth0 (PoE)', mediaType: 'cat6', style: 'orthogonal' },
        { id: 'cb4', sourceId: 'sw_b', targetId: 'phone_b', sourcePort: 'Fa0/2', targetPort: 'SW Port', mediaType: 'cat6', style: 'orthogonal' },
        { id: 'cb5', sourceId: 'sw_b', targetId: 'pc_b', sourcePort: 'Fa0/3', targetPort: 'Ethernet', mediaType: 'cat6', style: 'orthogonal' },
        { id: 'cb6', sourceId: 'ap_b', targetId: 'laptop_b', sourcePort: 'wlan0', targetPort: 'Wi-Fi / Eth', mediaType: 'wireless', style: 'bezier' }
      ],
      zones: [
        { id: 'z_b', name: 'Office Local Network', cidr: '192.168.1.0/24', x: 30, y: 360, width: 640, height: 160, color: '#f59e0b' }
      ]
    }
  },

  loadTemplate: function(key) {
    const tmpl = this.templates[key];
    if (tmpl) {
      window.appState.loadTopology({
        nodes: tmpl.nodes,
        cables: tmpl.cables,
        zones: tmpl.zones
      });
    }
  }
};
