import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;
const DATA_DIR = path.join(__dirname, 'data', 'projects');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// REST API Endpoints

// 1. List all saved projects
app.get('/api/projects', (req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    const projects = files.map(file => {
      const filePath = path.join(DATA_DIR, file);
      const stats = fs.statSync(filePath);
      let content = {};
      try {
        content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (e) {
        content = {};
      }
      return {
        id: path.basename(file, '.json'),
        name: content.name || path.basename(file, '.json'),
        nodeCount: Array.isArray(content.nodes) ? content.nodes.length : 0,
        cableCount: Array.isArray(content.cables) ? content.cables.length : 0,
        siteCount: Array.isArray(content.availableSites) ? content.availableSites.length : (content.siteRegions ? Object.keys(content.siteRegions).length : 0),
        updatedAt: content.updatedAt || stats.mtime.toISOString(),
        createdAt: content.createdAt || stats.birthtime.toISOString()
      };
    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json({ success: true, projects });
  } catch (error) {
    console.error('Failed to list projects:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Fetch specific project data
app.get('/api/projects/:id', (req, res) => {
  try {
    const projectId = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
    const filePath = path.join(DATA_DIR, `${projectId}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json({ success: true, project: data });
  } catch (error) {
    console.error(`Failed to load project ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Save or update project
app.post('/api/projects', (req, res) => {
  try {
    const { id, name, topology } = req.body;
    const projectId = (id || 'project_' + Date.now()).replace(/[^a-zA-Z0-9_-]/g, '');
    const filePath = path.join(DATA_DIR, `${projectId}.json`);
    
    const payload = {
      id: projectId,
      name: name || 'Untitled Topology',
      updatedAt: new Date().toISOString(),
      createdAt: req.body.createdAt || new Date().toISOString(),
      nodes: topology?.nodes || [],
      cables: topology?.cables || [],
      availableSites: topology?.availableSites || [],
      siteRegions: topology?.siteRegions || {}
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
    res.json({ success: true, project: payload });
  } catch (error) {
    console.error('Failed to save project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Delete project
app.delete('/api/projects/:id', (req, res) => {
  try {
    const projectId = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
    const filePath = path.join(DATA_DIR, `${projectId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error(`Failed to delete project ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve static frontend files from 'dist' (production) or project root
const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
} else {
  app.use(express.static(__dirname));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 NetForge Studio Server running on port ${PORT}`);
  console.log(`📁 Persistent project data dir: ${DATA_DIR}`);
});
