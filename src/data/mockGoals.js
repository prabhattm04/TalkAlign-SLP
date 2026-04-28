export const mockGoals = [
  {
    id: 'g1',
    patientId: 'p1', // Aarav Sharma
    title: 'Master /r/ blends across all word positions',
    type: 'long-term',
    status: 'in_progress', // not_started, in_progress, achieved
    baseline: '40% accuracy in structured sentences',
    target: '90% accuracy in conversational speech',
    createdAt: '2026-03-01',
    objectives: [
      { id: 'o1', text: 'Produce /r/ in initial position with 80% accuracy', status: 'achieved' },
      { id: 'o2', text: 'Produce /r/ in medial position with 80% accuracy', status: 'in_progress' },
      { id: 'o3', text: 'Produce /r/ in final position with 80% accuracy', status: 'not_started' },
    ],
    activities: [
      { id: 'a1', title: 'Minimal Pairs Card Game (/r/ vs /w/)', tags: ['Articulation', 'Game'], difficulty: 'Medium' },
      { id: 'a2', title: 'Read "The Red Rabbit" passage aloud', tags: ['Reading', 'Generalization'], difficulty: 'Hard' }
    ]
  },
  {
    id: 'g2',
    patientId: 'p1', // Aarav Sharma
    title: 'Improve expressive language vocabulary',
    type: 'long-term',
    status: 'not_started',
    baseline: 'Uses 50 core words',
    target: 'Use 100 core words spontaneously',
    createdAt: '2026-04-10',
    objectives: [
      { id: 'o4', text: 'Identify and use 10 new action verbs', status: 'not_started' },
      { id: 'o5', text: 'Combine noun+verb phrases consistently', status: 'not_started' },
    ],
    activities: [
      { id: 'a3', title: 'Action verb flashcards', tags: ['Vocabulary', 'Visual'], difficulty: 'Easy' }
    ]
  }
];
