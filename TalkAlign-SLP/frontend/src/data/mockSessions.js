// Mock session data — swap with real API calls later
export const mockSessions = [
  {
    id: 's1',
    patientId: 'p1',
    date: '2026-04-25',
    duration: 45,
    therapist: 'Dr. Aisha Nair',
    summary: 'Focused on /r/ blends using minimal pairs. Patient showed 70% accuracy.',
    soap: {
      subjective:
        "Patient's mother reports he practiced /r/ words daily at home. Patient says he feels 'better at saying words'. Mood cooperative and engaged.",
      objective:
        'Administered 20-item articulation probe for /r/ in initial, medial, and final positions. Accuracy: initial 75%, medial 65%, final 60%. Fluent speech rate maintained. No signs of fatigue.',
      assessment:
        'Patient is making steady progress in /r/ production across word positions. Stimulability for /r/ blends has increased from last session (from 40% to 55%). Prognosis remains good.',
      plan:
        'Continue targeting /r/ in blends at word level. Introduce phrase-level practice in next session. Home program: 10 minutes daily reading aloud with target words. Review progress in 2 sessions.',
    },
    aiParentSummary: "Aarav did a fantastic job today! He practiced his /r/ sounds and achieved 75% accuracy at the beginning of words. He was very cooperative and seemed to enjoy the session. Keep up the great work practicing reading aloud at home!",
    homePractice: [
      { id: 't1', title: 'Read 10 words starting with R aloud', completed: false },
      { id: 't2', title: 'Practice "rabbit" and "red" in a sentence', completed: true }
    ],
    status: 'completed',
  },
  {
    id: 's2',
    patientId: 'p1',
    date: '2026-04-18',
    duration: 45,
    therapist: 'Dr. Aisha Nair',
    summary: 'Introduced minimal pairs for /l/ vs /r/. Good engagement with game activities.',
    soap: {
      subjective:
        'Patient arrived on time. No complaints noted. Mother reports slight improvement in conversational speech.',
      objective:
        'Minimal pairs activity: 15 pairs, 60% accuracy. Tongue placement exercises: completed 3 sets of 10. Maintained attention throughout 45-minute session.',
      assessment:
        '/l/ production improving. /r/ remains primary target. Oral motor skills within functional limits for age.',
      plan:
        'Continue /r/ and /l/ discrimination. Add reading-level word lists. Increase home practice frequency.',
    },
    status: 'completed',
  },
  {
    id: 's3',
    patientId: 'p2',
    date: '2026-04-24',
    duration: 30,
    therapist: 'Dr. Aisha Nair',
    summary: 'Vocabulary expansion — 3-word sentences consistently produced.',
    soap: {
      subjective:
        "Father reports Sara said 'I want juice' spontaneously at home. This is a breakthrough for 3-word utterances.",
      objective:
        'Elicited 12 spontaneous 3-word utterances during play activities. Mean length of utterance (MLU): 2.8 (target 3.0). Followed 2-step instructions with 80% accuracy.',
      assessment:
        'Language skills approaching age-appropriate 3-word level. Comprehension ahead of expressive language as expected.',
      plan:
        'Target 3-word semantic relations. Introduce "subject-verb-object" sentence frames. Continue play-based intervention.',
    },
    aiParentSummary: "Sara is making wonderful progress! Today she spontaneously used 3-word sentences during our play time, which is a huge milestone. She's following instructions very well. We'll keep focusing on these longer sentences next time.",
    homePractice: [
      { id: 't3', title: 'Encourage Sara to ask for items using 3 words (e.g., "I want apple")', completed: false }
    ],
    status: 'completed',
  },
  {
    id: 's4',
    patientId: 'p3',
    date: '2026-04-22',
    duration: 50,
    therapist: 'Dr. Aisha Nair',
    summary: 'Slow speech technique practice with reading passage. Fluency at 85%.',
    soap: {
      subjective:
        "Rohan reports less stuttering in class presentations. Says 'I count to 3 before I speak'. Shows increased confidence.",
      objective:
        'Reading passage (100 words): 92% fluency with slow speech technique. Stuttering instances: 8 (down from 15 last session). No secondary behaviors noted today.',
      assessment:
        'Significant improvement in fluency with slow speech strategy. Transfer to spontaneous speech is the next milestone.',
      plan:
        'Begin generalization activities in simulated conversation. Introduce self-monitoring checklist. Parent counseling scheduled for next week.',
    },
    status: 'completed',
  },
  {
    id: 's5',
    patientId: 'p5',
    date: '2026-04-26',
    duration: 40,
    therapist: 'Dr. Aisha Nair',
    summary: 'AAC device symbol navigation. 6 new core vocabulary words added.',
    soap: {
      subjective:
        "Mother reports Dev used the AAC device to request 'more' at dinner. First spontaneous use outside therapy.",
      objective:
        'Navigated to 6 new vocabulary pages with 80% accuracy. Requested items using device on 9/12 opportunities. Joint attention maintained for 3-4 minutes.',
      assessment:
        'AAC use becoming more functional. Spontaneous initiation increasing. Core vocabulary expanding appropriately.',
      plan:
        'Add action words to device. Work on commenting function. Schedule caregiver training for device programming.',
    },
    status: 'completed',
  },
  {
    id: 's6',
    patientId: 'p6',
    date: '2026-04-29',
    time: '10:00 AM',
    duration: 45,
    therapist: 'Dr. Aisha Nair',
    summary: 'Scheduled: Phonological awareness exercises.',
    status: 'scheduled',
  },
  {
    id: 's7',
    patientId: 'p4',
    date: '2026-04-30',
    time: '02:00 PM',
    duration: 30,
    therapist: 'Dr. Aisha Nair',
    summary: 'Scheduled: Vocal hygiene review.',
    status: 'scheduled',
  },
];
