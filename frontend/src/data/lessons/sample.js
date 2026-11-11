export const sampleLesson = {
  title: 'Photosynthesis Light-Dependent Reactions',
  caption: 'How photon absorption by chlorophyll drives electron transport to synthesize ATP and NADPH.',
  mermaid: `graph TD
  Light[Photons Absorbed] --> PSII[Photosystem II]
  PSII --> ETC[Electron Transport Chain]
  ETC --> PSI[Photosystem I]
  PSI --> Synthesis[ATP & NADPH Synthesis]`,
  steps: [
    {
      nodeId: 'Light',
      explanation: 'Solar photons strike chlorophyll pigments in the thylakoid membrane, elevating electrons to an excited state.',
      caption: 'Light energy absorption triggers the photolysis of water molecules into oxygen, protons, and electrons.',
    },
    {
      nodeId: 'PSII',
      explanation: 'Photosystem II captures high-energy electrons from split water molecules and funnels them into the membrane.',
      caption: 'Oxygen gas is released as a vital photosynthetic byproduct during this oxidation step.',
    },
    {
      nodeId: 'ETC',
      explanation: 'Electrons cascade through cytochromes in the transport chain, pumping protons into the thylakoid lumen.',
      caption: 'The resulting electrochemical gradient establishes the proton-motive force powering ATP synthase.',
    },
    {
      nodeId: 'PSI',
      explanation: 'Photosystem I absorbs additional light energy from secondary photons to re-energize the incoming electrons.',
      caption: 'Re-energized electrons are directed toward ferredoxin and NADP+ reductase.',
    },
    {
      nodeId: 'Synthesis',
      explanation: 'NADP+ reductase couples electrons and protons to form NADPH while ATP synthase generates ATP.',
      caption: 'Both ATP and NADPH are directly fed into the Calvin cycle for carbon fixation.',
    },
  ],
};

