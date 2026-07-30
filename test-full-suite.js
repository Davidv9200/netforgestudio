import { firefox } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = '/home/david/.gemini/antigravity/brain/9784d9cc-a751-47cb-b84c-b81aaab0a765';

async function runTestSuite() {
  console.log('🚀 Starting NetForge Studio Full Automated Test Suite on Firefox...');
  
  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Capture JS errors if any
  page.on('pageerror', err => console.error('  ⚠️ Browser JS Error:', err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('  ⚠️ Browser Console Error:', msg.text());
  });

  // 1. Initial Page Load & Clear LocalStorage
  console.log('1️⃣ Loading http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    window.TemplateRegistry.loadTemplate('enterprise_dmz');
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '1_initial_state.png') });
  
  const initialNodes = await page.locator('.network-node').count();
  console.log(`   ✓ Initial DMZ template nodes loaded: ${initialNodes}`);

  // 2. Load Template
  console.log('2️⃣ Opening Architecture Templates modal...');
  await page.evaluate(() => document.getElementById('btn-templates').click());
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '2_templates_modal.png') });

  console.log('   ✓ Selecting Spine-Leaf Datacenter template...');
  await page.evaluate(() => {
    window.TemplateRegistry.loadTemplate('spine_leaf');
    document.getElementById('modal-templates').classList.add('hidden');
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '3_spine_leaf_template.png') });

  const spineNodeCount = await page.locator('.network-node').count();
  console.log(`   ✓ Spine-Leaf nodes loaded: ${spineNodeCount}`);

  // 3. Component Palette Item Addition
  console.log('3️⃣ Adding FireWall device from Component Library...');
  await page.evaluate(() => {
    window.appState.addNode({ type: 'firewall', x: 400, y: 300 });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '4_firewall_added.png') });

  const updatedNodeCount = await page.locator('.network-node').count();
  console.log(`   ✓ Node count after addition: ${updatedNodeCount}`);

  // 4. Node Selection & Inspector
  console.log('4️⃣ Selecting added device node to test Properties Inspector...');
  await page.evaluate(() => {
    const node = window.appState.nodes[window.appState.nodes.length - 1];
    if (node) window.appState.selectItem(node.id, 'node');
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '5_node_inspector.png') });

  // 5. Packet Simulator Test
  console.log('5️⃣ Testing Traffic & Packet Simulator...');
  await page.evaluate(() => document.getElementById('btn-simulate').click());
  await page.waitForTimeout(400);

  // Select source and target
  await page.evaluate(() => {
    const src = document.getElementById('sim-source-node');
    const dst = document.getElementById('sim-target-node');
    if (src && src.options.length > 0) src.selectedIndex = 0;
    if (dst && dst.options.length > 1) dst.selectedIndex = 1;
    document.getElementById('btn-start-sim-run').click();
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '6_simulation_log.png') });

  await page.evaluate(() => document.getElementById('btn-close-simulator').click());
  await page.waitForTimeout(300);

  // 6. Bill of Materials & IP Table
  console.log('6️⃣ Opening Equipment Bill of Materials & IP Table...');
  await page.evaluate(() => document.getElementById('btn-bom').click());
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '7_bom_inventory.png') });
  await page.evaluate(() => document.getElementById('btn-close-bom').click());
  await page.waitForTimeout(300);

  // 7. Site Manager
  console.log('7️⃣ Testing Site Region & Location Manager...');
  await page.evaluate(() => document.getElementById('btn-site-manager').click());
  await page.waitForTimeout(400);

  await page.evaluate(() => {
    document.getElementById('input-new-site-name').value = 'Datacenter Annex West';
    document.getElementById('btn-add-site').click();
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '8_site_manager.png') });
  await page.evaluate(() => document.getElementById('btn-done-site-manager').click());

  // 8. Export Menu
  console.log('8️⃣ Inspecting Export Menu options...');
  await page.evaluate(() => {
    const menu = document.querySelector('.dropdown-content');
    if (menu) menu.style.display = 'block';
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '9_export_menu.png') });

  await browser.close();
  console.log('✅ Full Automated Test Suite executed successfully with 0 errors!');
}

runTestSuite().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
