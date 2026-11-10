/**
 * Mermaid Flowchart Parser & Layout Engine for React Flow
 * Parses graph TD/LR/TB flowchart syntax into React Flow nodes and edges,
 * and derives topological animation sequence steps.
 */

export function parseMermaidFlowchart(mermaidCode) {
  if (!mermaidCode || typeof mermaidCode !== 'string') {
    return { nodes: [], edges: [], steps: [] };
  }

  // Remove code blocks and trim
  const clean = mermaidCode
    .replace(/^```(?:mermaid)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Normalize semicolons and split lines
  const lines = clean
    .replace(/;/g, '\n')
    .split('\n')
    .map((l) => l.replace(/%%.*$/, '').trim())
    .filter((l) => l);

  // Detect orientation: TD / TB / LR / RL
  let isHorizontal = false;
  const firstLine = lines[0] || '';
  if (/graph\s+LR|flowchart\s+LR/i.test(firstLine)) {
    isHorizontal = true;
  }

  const nodesMap = new Map();
  const edges = [];

  // Helper to register node
  const getOrCreateNode = (id, rawLabel = '') => {
    let cleanId = id.trim().replace(/['"]/g, '');
    if (!cleanId) return null;

    // Remove any accidental trailing arrow parts
    cleanId = cleanId.replace(/--.*$/, '').trim();
    if (!cleanId) return null;

    let label = rawLabel.trim();
    if (label.startsWith('"') && label.endsWith('"')) {
      label = label.slice(1, -1);
    }
    if (label.startsWith("'") && label.endsWith("'")) {
      label = label.slice(1, -1);
    }

    if (!nodesMap.has(cleanId)) {
      nodesMap.set(cleanId, {
        id: cleanId,
        label: label || cleanId,
        incoming: [],
        outgoing: [],
      });
    } else if (label) {
      const existing = nodesMap.get(cleanId);
      if (!existing.label || existing.label === cleanId) {
        existing.label = label;
      }
    }
    return nodesMap.get(cleanId);
  };

  // Node extract regex matching: NodeId["Label text"] or NodeId("Label") or NodeId{"Label"}
  const nodeDefRegex = /^([a-zA-Z0-9_-]+)\s*(\[|\(|\{|\(\()(["']?)(.*?)\3(\]|\)|\}|\)\))$/;

  const parseEndpoint = (token) => {
    const trimmed = token.trim();
    const match = trimmed.match(nodeDefRegex);
    if (match) {
      const [, id, , , label] = match;
      return getOrCreateNode(id, label);
    }

    // Direct bracket match inside token if compound e.g. A[Label]
    const bracketMatch = trimmed.match(/^([a-zA-Z0-9_-]+)(?:\[(.*?)\]|\((.*?)\)|\{(.*?)\})/);
    if (bracketMatch) {
      const id = bracketMatch[1];
      const label = bracketMatch[2] || bracketMatch[3] || bracketMatch[4] || id;
      return getOrCreateNode(id, label);
    }

    // Handle token with inline arrow text: A -- text
    const textArrowMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*--.*$/);
    if (textArrowMatch) {
      return getOrCreateNode(textArrowMatch[1], textArrowMatch[1]);
    }

    // Plain ID
    const plainId = trimmed.replace(/[^a-zA-Z0-9_-]/g, '');
    if (plainId) {
      return getOrCreateNode(plainId, plainId);
    }
    return null;
  };

  lines.forEach((line) => {
    if (/^(graph|flowchart|subgraph|end|style|classDef|class)\b/i.test(line)) {
      return;
    }

    // Check if line contains edge(s): -->, ==>, -.->, or -- text -->
    if (line.includes('-->') || line.includes('==>') || line.includes('-.->')) {
      // Split on multiple chained connections
      const parts = line.split(/(?:-->|==>|-\.->)/g);

      for (let i = 0; i < parts.length - 1; i++) {
        let leftToken = parts[i].trim();
        let rightToken = parts[i + 1].trim();
        let edgeLabel = '';

        // Extract pipe label e.g. -->|Label| B
        const pipeMatch = rightToken.match(/^\|(.*?)\|\s*(.*)$/);
        if (pipeMatch) {
          edgeLabel = pipeMatch[1].trim();
          rightToken = pipeMatch[2].trim();
        }

        // Extract -- text --> label from left token
        const textLabelMatch = leftToken.match(/^(.*?)\s*--\s*["']?(.*?)["']?\s*$/);
        if (textLabelMatch) {
          leftToken = textLabelMatch[1].trim();
          edgeLabel = textLabelMatch[2].trim();
        }

        const sourceNode = parseEndpoint(leftToken);
        const targetNode = parseEndpoint(rightToken);

        if (sourceNode && targetNode && sourceNode.id !== targetNode.id) {
          const edgeId = `e_${sourceNode.id}_${targetNode.id}_${edges.length}`;
          edges.push({
            id: edgeId,
            source: sourceNode.id,
            target: targetNode.id,
            label: edgeLabel,
            type: 'diagramEdge',
          });
          sourceNode.outgoing.push(targetNode.id);
          targetNode.incoming.push(sourceNode.id);
        }
      }
    } else {
      // Standalone node definition
      const match = line.match(nodeDefRegex);
      if (match) {
        const [, id, , , label] = match;
        getOrCreateNode(id, label);
      }
    }
  });

  // Calculate topological ranks for layout & animation sequencing
  const inDegree = new Map();
  nodesMap.forEach((_, id) => {
    inDegree.set(id, 0);
  });
  edges.forEach((edge) => {
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Kahn's algorithm for rank/column level assignment
  const levels = new Map();
  const queue = [];

  nodesMap.forEach((_, id) => {
    if (inDegree.get(id) === 0) {
      queue.push(id);
      levels.set(id, 0);
    }
  });

  // Fallback if graph has cycles or disconnected root nodes
  if (queue.length === 0 && nodesMap.size > 0) {
    const firstId = nodesMap.keys().next().value;
    queue.push(firstId);
    levels.set(firstId, 0);
  }

  const processed = new Set();
  const topologicalOrder = [];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (processed.has(currentId)) continue;
    processed.add(currentId);
    topologicalOrder.push(currentId);

    const currentLevel = levels.get(currentId) || 0;
    const nodeObj = nodesMap.get(currentId);

    if (nodeObj) {
      nodeObj.outgoing.forEach((targetId) => {
        const nextLevel = Math.max(levels.get(targetId) || 0, currentLevel + 1);
        levels.set(targetId, nextLevel);

        const newDeg = (inDegree.get(targetId) || 1) - 1;
        inDegree.set(targetId, newDeg);
        if (newDeg <= 0 && !processed.has(targetId)) {
          queue.push(targetId);
        }
      });
    }
  }

  // Include any remaining disconnected nodes
  nodesMap.forEach((_, id) => {
    if (!processed.has(id)) {
      topologicalOrder.push(id);
      levels.set(id, (levels.get(id) || 0) + 1);
    }
  });

  // Group nodes by levels to assign layout coordinates (grid/rank placement)
  const levelGroups = new Map();
  nodesMap.forEach((_, id) => {
    const lvl = levels.get(id) || 0;
    if (!levelGroups.has(lvl)) {
      levelGroups.set(lvl, []);
    }
    levelGroups.get(lvl).push(id);
  });

  const gapX = isHorizontal ? 290 : 250;
  const gapY = isHorizontal ? 120 : 130;

  const flowNodes = [];

  levelGroups.forEach((nodeIds, lvl) => {
    const count = nodeIds.length;
    const totalBreadth = (count - 1) * (isHorizontal ? gapY : gapX);
    const offsetStart = -totalBreadth / 2;

    nodeIds.forEach((id, idx) => {
      const nodeData = nodesMap.get(id);
      let posX = 0;
      let posY = 0;

      if (isHorizontal) {
        posX = lvl * gapX + 80;
        posY = 220 + offsetStart + idx * gapY;
      } else {
        posX = 320 + offsetStart + idx * gapX;
        posY = lvl * gapY + 70;
      }

      flowNodes.push({
        id,
        type: 'diagramNode',
        position: { x: posX, y: posY },
        data: {
          id,
          label: nodeData.label || id,
          stepIndex: topologicalOrder.indexOf(id) + 1,
          totalSteps: nodesMap.size,
          incoming: nodeData.incoming,
          outgoing: nodeData.outgoing,
          level: lvl,
        },
      });
    });
  });

  // Construct educational step sequence
  const steps = topologicalOrder.map((nodeId, idx) => {
    const node = nodesMap.get(nodeId);
    const activeEdges = edges.filter(
      (e) => e.target === nodeId || (idx === 0 && e.source === nodeId)
    );

    return {
      stepIndex: idx,
      nodeId,
      label: node?.label || nodeId,
      activeEdgeIds: activeEdges.map((e) => e.id),
      incomingCount: node?.incoming?.length || 0,
      outgoingCount: node?.outgoing?.length || 0,
    };
  });

  return {
    nodes: flowNodes,
    edges,
    steps,
    isHorizontal,
  };
}
