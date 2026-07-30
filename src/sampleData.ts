import { Subject } from './types';

// Utility helper to generate dates relative to current date
const getFutureDate = (daysFromNow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

const getPastDateISO = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

export const sampleSubjects: Subject[] = [
  {
    id: 'sub-patho-1',
    name: 'Pathology - Endocrine System',
    color: '#6366F1', // Indigo
    examDate: getFutureDate(18),
    chapters: [
      {
        id: 'chap-1-1',
        name: 'Thyroid & Parathyroid Disorders',
        lectures: [
          {
            id: 'lec-1-1-1',
            name: 'Hyperthyroidism & Thyroiditis',
            notes: 'Pay close attention to Hurthle cells in Hashimoto and Orphan Annie eyes in Papillary CA.',
            isHighYield: true,
            dateFirstStudied: getPastDateISO(10),
            lastReviewed: getPastDateISO(2),
            links: [
              { id: 'link-1', label: 'Pathoma Endocrine Review Video', url: 'https://example.com/pathoma' }
            ],
            tasks: [
              { id: 'task-1', type: 'quiz', label: 'Endocrine Online Quiz 1', done: true, dateCompleted: getPastDateISO(3), estimatedMinutes: 20 },
              { id: 'task-2', type: 'past_exam', label: 'Past Exam MCQs (2020 - 2025)', done: false, estimatedMinutes: 45 },
              { id: 'task-3', type: 'sheet', label: 'Thyroid Pathology Revision Sheet', done: true, dateCompleted: getPastDateISO(1), estimatedMinutes: 15 }
            ],
            topics: [
              { id: 'top-1', name: 'Graves Disease Autoantibodies & Pathogenesis', masteryLevel: 'weak', lastReviewed: getPastDateISO(2) },
              { id: 'top-2', name: 'Toxic Multinodular Goiter & Plummer Syndrome', masteryLevel: 'good', lastReviewed: getPastDateISO(4) },
              { id: 'top-3', name: 'Hashimoto Thyroiditis Pathology & HLA-DR5', masteryLevel: 'good', lastReviewed: getPastDateISO(2) },
              { id: 'top-4', name: 'Subacute Granulomatous (De Quervain) Thyroiditis', masteryLevel: 'weak', lastReviewed: getPastDateISO(5) },
              { id: 'top-5', name: 'Riedel Thyroiditis & IgG4 Related Disease', masteryLevel: 'excellent', lastReviewed: getPastDateISO(1) }
            ]
          },
          {
            id: 'lec-1-1-2',
            name: 'Thyroid Neoplasms & Carcinomas',
            notes: 'High probability exam topic! Memorize histological markers.',
            isHighYield: true,
            dateFirstStudied: getPastDateISO(8),
            lastReviewed: getPastDateISO(3),
            tasks: [
              { id: 'task-4', type: 'past_exam', label: 'Thyroid Tumors Past MCQs', done: false, estimatedMinutes: 30 }
            ],
            topics: [
              { id: 'top-6', name: 'Papillary Carcinoma (Psammoma bodies & Psammoma bodies)', masteryLevel: 'weak', lastReviewed: getPastDateISO(3) },
              { id: 'top-7', name: 'Follicular Carcinoma vs Adenoma (Capsular Invasion)', masteryLevel: 'good', lastReviewed: getPastDateISO(3) },
              { id: 'top-8', name: 'Medullary Thyroid Carcinoma & Calcitonin / MEN2', masteryLevel: 'weak', lastReviewed: getPastDateISO(6) },
              { id: 'top-9', name: 'Anaplastic Carcinoma Features in Elderly', masteryLevel: 'excellent', lastReviewed: getPastDateISO(8) }
            ]
          }
        ]
      },
      {
        id: 'chap-1-2',
        name: 'Adrenal Gland Pathology',
        lectures: [
          {
            id: 'lec-1-2-1',
            name: 'Cushing Syndrome & Adrenal Insufficiency',
            isHighYield: false,
            dateFirstStudied: getPastDateISO(12),
            lastReviewed: getPastDateISO(4),
            tasks: [
              { id: 'task-5', type: 'sheet', label: 'Dexamethasone Suppression Test Flowchart', done: true, dateCompleted: getPastDateISO(4) }
            ],
            topics: [
              { id: 'top-10', name: 'High-dose vs Low-dose Dexamethasone Test', masteryLevel: 'good', lastReviewed: getPastDateISO(4) },
              { id: 'top-11', name: 'Primary Aldosteronism (Conn Syndrome)', masteryLevel: 'excellent', lastReviewed: getPastDateISO(4) },
              { id: 'top-12', name: 'Addison Disease & Waterhouse-Friderichsen', masteryLevel: 'good', lastReviewed: getPastDateISO(7) }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'sub-pharm-2',
    name: 'Pharmacology - ANS & Cardiovascular',
    color: '#059669', // Emerald
    examDate: getFutureDate(28),
    chapters: [
      {
        id: 'chap-2-1',
        name: 'Autonomic Nervous System',
        lectures: [
          {
            id: 'lec-2-1-1',
            name: 'Cholinergic Agonists & Antagonists',
            isHighYield: true,
            dateFirstStudied: getPastDateISO(14),
            lastReviewed: getPastDateISO(1),
            tasks: [
              { id: 'task-6', type: 'quiz', label: 'ANS Drug Mechanism Quiz', done: true, dateCompleted: getPastDateISO(1) }
            ],
            topics: [
              { id: 'top-13', name: 'Organophosphate Toxicity & Atropine / Pralidoxime', masteryLevel: 'excellent', lastReviewed: getPastDateISO(1) },
              { id: 'top-14', name: 'Direct-acting Muscarinic Agonists (Pilocarpine & Bethanechol)', masteryLevel: 'good', lastReviewed: getPastDateISO(5) },
              { id: 'top-15', name: 'Scopolamine & Atropine Side Effects', masteryLevel: 'excellent', lastReviewed: getPastDateISO(1) }
            ]
          },
          {
            id: 'lec-2-1-2',
            name: 'Antihypertensives & Beta Blockers',
            isHighYield: true,
            dateFirstStudied: getPastDateISO(6),
            lastReviewed: getPastDateISO(2),
            tasks: [
              { id: 'task-7', type: 'past_exam', label: 'Hypertension Clinical Cases', done: false, estimatedMinutes: 40 }
            ],
            topics: [
              { id: 'top-16', name: 'Selective vs Non-selective Beta Blockers in Asthma', masteryLevel: 'weak', lastReviewed: getPastDateISO(2) },
              { id: 'top-17', name: 'ACE Inhibitors (Cough, Angioedema) vs ARBs', masteryLevel: 'good', lastReviewed: getPastDateISO(3) },
              { id: 'top-18', name: 'Dihydropyridine vs Non-dihydropyridine CCBs', masteryLevel: 'weak', lastReviewed: getPastDateISO(2) }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'sub-cardio-3',
    name: 'Clinical Cardiology & Internal Medicine',
    color: '#EC4899', // Pink / Rose
    examDate: getFutureDate(35),
    chapters: [
      {
        id: 'chap-3-1',
        name: 'Ischemic Heart Disease',
        lectures: [
          {
            id: 'lec-3-1-1',
            name: 'Acute Coronary Syndromes (ACS)',
            isHighYield: true,
            dateFirstStudied: getPastDateISO(15),
            lastReviewed: getPastDateISO(5),
            tasks: [
              { id: 'task-8', type: 'past_exam', label: 'ECG Interpretation Cases', done: true, dateCompleted: getPastDateISO(5), estimatedMinutes: 60 },
              { id: 'task-9', type: 'quiz', label: 'ACS Biomarkers Quiz', done: true, dateCompleted: getPastDateISO(5) }
            ],
            topics: [
              { id: 'top-19', name: 'NSTEMI vs STEMI ECG Criteria', masteryLevel: 'good', lastReviewed: getPastDateISO(5) },
              { id: 'top-20', name: 'Cardiac Biomarkers Timeline (Troponin I/T vs CK-MB)', masteryLevel: 'excellent', lastReviewed: getPastDateISO(5) },
              { id: 'top-21', name: 'MONA-BASH Protocol & Thrombolysis Indications', masteryLevel: 'good', lastReviewed: getPastDateISO(5) },
              { id: 'top-22', name: 'Post-MI Complications Timeline (Rupture vs Aneurysm)', masteryLevel: 'weak', lastReviewed: getPastDateISO(7) }
            ]
          }
        ]
      }
    ]
  }
];

// Pre-fill initial daily activity log for heatmap
export const initialActivityLog = () => {
  const log: { [date: string]: number } = {};
  const today = new Date();
  
  // Fill random activities across last 60 days
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Create organic activity clusters
    if (i % 2 === 0 || i % 5 === 0) {
      log[dateStr] = (i % 4) + 1;
    }
  }
  // Ensure today has activity
  log[today.toISOString().split('T')[0]] = 4;
  return log;
};
