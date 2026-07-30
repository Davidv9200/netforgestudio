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

## Running Locally & Development

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server (interactive UI on port 5173)
npm run dev

# 3. Build production bundle (generates dist/)
npm run build

# 4. Start production Express backend (serves app & project storage API on port 80/PORT)
npm start
```

---

## Deployment Quick Start

For detailed step-by-step guides, refer to the **[Deployment Runbook & Knowledge Base (DEPLOYMENT.md)](file:///home/david/Documents/Projects/netforgestudio/netforgestudio/DEPLOYMENT.md)**.

### Option 1: Automated Server Deployment (Ubuntu / Debian / CentOS)
Run the automated deployment script on your Linux VPS / server:

```bash
curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/netforgestudio/main/setup-server.sh | bash
```

### Option 2: Docker Container Deployment
```bash
# Build Docker image
docker build -t netforge-studio .

# Launch container with persistent volume on Port 80
docker run -d \
  --name netforge-app \
  --restart always \
  -p 80:80 \
  -v /opt/netforgestudio/data:/app/data \
  netforge-studio
```

### Option 3: GitHub Pages / Vercel / Netlify / Nginx
NetForge Studio compiles into pure static assets (`dist/`) and can be hosted on GitHub Pages, Vercel, Netlify, or Nginx. Full CI/CD workflow examples are available in **[DEPLOYMENT.md](file:///home/david/Documents/Projects/netforgestudio/netforgestudio/DEPLOYMENT.md)**.
