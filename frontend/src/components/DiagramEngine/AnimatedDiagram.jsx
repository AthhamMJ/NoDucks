import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  useNodesInitialized,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { parseMermaidFlowchart } from "./mermaidParser";
import { DiagramNode } from "./DiagramNode";
import { DiagramEdge } from "./DiagramEdge";
import { DiagramControls } from "./DiagramControls";
import { DiagramExplanation } from "./DiagramExplanation";
import { useDiagramNarration } from "./useDiagramNarration";
import styles from "./AnimatedDiagram.module.css";

const nodeTypes = {
  diagramNode: DiagramNode,
};

const edgeTypes = {
  diagramEdge: DiagramEdge,
};

function AnimatedDiagramInner({ mermaidCode, caption, title, theme = "dark" }) {
  const { fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();

  // Parse mermaid flowchart into React Flow format
  const parsedData = useMemo(() => {
    return parseMermaidFlowchart(mermaidCode);
  }, [mermaidCode]);

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playId, setPlayId] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);

  const steps = parsedData.steps;
  const totalSteps = steps.length;
  const isHorizontal = parsedData.isHorizontal;

  const handleNextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= totalSteps - 1) {
        return 0;
      }
      return prev + 1;
    });
  }, [totalSteps]);

  // Browser-native Speech Synthesis Narration Hook
  const {
    isSupported: isNarrationSupported,
    isEnabled: isNarrationEnabled,
    narrationFailed,
    voices,
    selectedVoice,
    toggleNarration,
    setSelectedVoice,
    stopNarration,
  } = useDiagramNarration({
    title,
    steps,
    caption,
    currentStep,
    isPlaying,
    playId,
    onStepComplete: handleNextStep,
  });

  // Derive active states for nodes based on current animation step
  const activeNodeId = steps[currentStep]?.nodeId || null;

  const currentNodes = useMemo(() => {
    return parsedData.nodes.map((node) => {
      const stepOrderIndex = steps.findIndex((s) => s.nodeId === node.id);
      const isCompleted = stepOrderIndex < currentStep;
      const isActive = node.id === activeNodeId;
      const isPending = stepOrderIndex > currentStep;

      return {
        ...node,
        data: {
          ...node.data,
          isActive,
          isCompleted,
          isPending,
          isHorizontal,
        },
      };
    });
  }, [parsedData.nodes, steps, currentStep, activeNodeId, isHorizontal]);

  const currentEdges = useMemo(() => {
    const isDark = theme === "dark";
    const activeEdgeColor = isDark ? "#818cf8" : "#6366f1";
    const defaultColor = isDark
      ? "rgba(255, 255, 255, 0.16)"
      : "rgba(0, 0, 0, 0.12)";
    const completedColor = "#10b981";

    return parsedData.edges.map((edge) => {
      const sourceStepIdx = steps.findIndex((s) => s.nodeId === edge.source);
      const targetStepIdx = steps.findIndex((s) => s.nodeId === edge.target);

      const isActive =
        edge.target === activeNodeId ||
        (currentStep === 0 && edge.source === activeNodeId);
      const isCompleted = targetStepIdx <= currentStep && !isActive;

      return {
        ...edge,
        data: {
          label: edge.label,
          isActive,
          isCompleted,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: isActive
            ? activeEdgeColor
            : isCompleted
              ? completedColor
              : defaultColor,
        },
      };
    });
  }, [parsedData.edges, steps, currentStep, activeNodeId, theme]);

  const [nodes, setNodes, onNodesChange] = useNodesState(currentNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentEdges);

  // Synchronize state when nodes/edges compute
  useEffect(() => {
    setNodes((prev) => {
      const positions = new Map(prev.map((n) => [n.id, n.position]));
      return currentNodes.map((n) => ({
        ...n,
        position: positions.get(n.id) ?? n.position,
      }));
    });
  }, [currentNodes, setNodes]);

  useEffect(() => {
    setEdges(currentEdges);
  }, [currentEdges, setEdges]);

  // Initial fit view with auto zoom bounds once nodes are initialized
  useEffect(() => {
    if (nodesInitialized && parsedData.nodes.length > 0) {
      fitView({ padding: 0.25, duration: 300 });
    }
  }, [nodesInitialized, parsedData.nodes.length, fitView]);

  // Animation player step interval (used when voice narration is disabled)
  useEffect(() => {
    // If voice narration is active, speech onend handles the step pacing naturally
    if (!isPlaying || totalSteps <= 1 || (isNarrationEnabled && !narrationFailed)) return;

    const intervalTime = Math.max(1200, 3200 / speed);
    const interval = setInterval(() => {
      handleNextStep();
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, totalSteps, speed, isNarrationEnabled, narrationFailed, handleNextStep]);

  const handlePlayToggle = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handlePrev = useCallback(() => {
    setIsPlaying(false);
    stopNarration();
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, [stopNarration]);

  const handleNext = useCallback(() => {
    setIsPlaying(false);
    stopNarration();
    setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
  }, [totalSteps, stopNarration]);

  const handleRestart = useCallback(() => {
    stopNarration();
    setCurrentStep(0);
    setIsPlaying(true);
    setPlayId((p) => p + 1);
    fitView({ padding: 0.25, duration: 400 });
  }, [fitView, stopNarration]);

  const handleSpeedChange = useCallback((newSpeed) => {
    setSpeed(newSpeed);
  }, []);

  const handleNodeClick = useCallback(
    (_, node) => {
      setIsPlaying(false);
      stopNarration();
      setSelectedNode(node.data);
      const stepIdx = steps.findIndex((s) => s.nodeId === node.id);
      if (stepIdx !== -1) {
        setCurrentStep(stepIdx);
      }
    },
    [steps, stopNarration],
  );

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.25, duration: 400 });
  }, [fitView]);

  const activeStep = steps[currentStep] || null;

  return (
    <div className={styles.wrapper}>
      {/* Top Playback Control Bar */}
      <div className={styles.topBar}>
        <DiagramControls
          isPlaying={isPlaying}
          currentStep={currentStep}
          totalSteps={totalSteps}
          speed={speed}
          onPlayToggle={handlePlayToggle}
          onPrev={handlePrev}
          onNext={handleNext}
          onRestart={handleRestart}
          onSpeedChange={handleSpeedChange}
          onFitView={handleFitView}
          isNarrationSupported={isNarrationSupported}
          isNarrationEnabled={isNarrationEnabled}
          onToggleNarration={toggleNarration}
          voices={voices}
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
        />
      </div>

      {/* Main Interactive Diagram Viewport */}
      <div className={styles.flowContainer}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            color={theme === "dark" ? "#27272a" : "#e4e4e7"}
            gap={20}
            size={1.2}
          />
          <Controls showInteractive={false} className={styles.rfControls} />
        </ReactFlow>
      </div>

      {/* Educational Concept Explanation Bar */}
      <div className={styles.explanationBar}>
        <DiagramExplanation
          activeStep={activeStep}
          totalSteps={totalSteps}
          caption={caption}
          selectedNode={selectedNode}
        />
      </div>
    </div>
  );
}

export function AnimatedDiagram({
  mermaidCode,
  caption,
  title,
  theme = "dark",
}) {
  return (
    <ReactFlowProvider>
      <AnimatedDiagramInner
        mermaidCode={mermaidCode}
        caption={caption}
        title={title}
        theme={theme}
      />
    </ReactFlowProvider>
  );
}
