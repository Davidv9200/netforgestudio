# NetForge Studio - Interactive Network Topology Editor

NetForge Studio is an interactive, web-based network design, topology diagramming, and traffic simulation suite. Built with HTML5, CSS3 (Glassmorphism design system), and vanilla ES6 Javascript.

## Key Features

- **Interactive Vector Canvas & Grid**: Infinite vector workspace, pan & zoom controls, grid snapping, snap-to-alignment guides, and mini-map navigator.
- **Component Palette Library**:
  - Network Gear: Edge Routers, L2/L3 Core Switches, Next-Gen Firewalls, Wireless Access Points, Internet Cloud.
  - Servers & Cloud: Web Servers, Database Servers, SAN/NAS Storage Arrays.
  - Endpoints: Workstation PCs, Mobile Laptops, IP Phones.
  - Subnet Containers: VLAN Subnet Zones and Perimeter DMZ security zones.
- **Smart Cable Links**: Ethernet Cat6 (10G), Fiber Optic (100G), Wireless 5G, and VPN IPsec Tunnels with Bezier and Orthogonal right-angle curve routing.
- **Real-Time Property Inspector**: Hostname, IPv4 Address, Subnet Mask, Default Gateway, MAC address editing, and IP collision warning flags.
- **Packet Traffic Simulator**: Interactive ICMP Ping traceroute and packet flow visual animations across linked nodes.
- **Pre-Built Architecture Templates**:
  1. Enterprise Dual-Homed Perimeter DMZ
  2. Spine-Leaf Data Center Topology
  3. Small Business Office Network
  4. Hybrid Cloud VPN Network
- **Export & Reporting**: Export to scalable vector `.svg`, high-resolution `.png`, JSON project files, and Bill of Materials (BOM) inventory table.

## Running Locally

To start the local web dev server:

```bash
python3 -m http.server 8000
```

Then open your browser to `http://localhost:8000`.
