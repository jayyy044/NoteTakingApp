// Generate mock data for testing
export const createMockNotebooks = () => {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'notebook-1',
      title: 'Fall2025',
      color: '#9b59b6',
      isExpanded: true,
      sections: [
        {
          id: 'section-1-1',
          title: 'CH E 243',
          isExpanded: false,
          pages: [
            {
              id: 'page-1-1-1',
              title: 'Lecture Notes Week 1',
              lastModified: weekAgo,
              strokes: [],
              textBoxes: [],
              importedFiles: [],
              background: 'lined',
            },
            {
              id: 'page-1-1-2',
              title: 'Problem Set 1',
              lastModified: dayAgo,
              strokes: [],
              textBoxes: [],
              importedFiles: [],
              background: 'grid',
            },
          ],
        },
        {
          id: 'section-1-2',
          title: 'MAT E 201',
          isExpanded: false,
          pages: [
            {
              id: 'page-1-2-1',
              title: 'Crystal Structures',
              lastModified: dayAgo,
              strokes: [],
              textBoxes: [],
              importedFiles: [],
              background: 'blank',
            },
          ],
        },
        {
          id: 'section-1-3',
          title: 'ECE 304',
          isExpanded: true,
          pages: [
            {
              id: 'page-1-3-1',
              title: 'Topic 14 Review',
              lastModified: hourAgo,
              strokes: [],
              textBoxes: [],
              importedFiles: [],
              background: 'blank',
            },
            {
              id: 'page-1-3-2',
              title: 'Dynamic Logic',
              lastModified: hourAgo,
              strokes: [],
              textBoxes: [],
              importedFiles: [],
              background: 'blank',
            },
            {
              id: 'page-1-3-3',
              title: 'Assignment 4F',
              lastModified: now,
              strokes: [
                // Sample circuit diagram strokes
                // Vertical line
                {
                  id: 'stroke-1',
                  points: [
                    { x: 80, y: 120, pressure: 0.8 },
                    { x: 80, y: 180, pressure: 0.8 },
                    { x: 80, y: 240, pressure: 0.8 },
                    { x: 80, y: 300, pressure: 0.8 },
                  ],
                  color: '#ffffff',
                  width: 3,
                  tool: 'pen',
                },
                // Capacitor symbol top line
                {
                  id: 'stroke-2',
                  points: [
                    { x: 60, y: 200, pressure: 0.7 },
                    { x: 100, y: 200, pressure: 0.7 },
                  ],
                  color: '#ffffff',
                  width: 3,
                  tool: 'pen',
                },
                // Capacitor symbol bottom line
                {
                  id: 'stroke-3',
                  points: [
                    { x: 60, y: 220, pressure: 0.7 },
                    { x: 100, y: 220, pressure: 0.7 },
                  ],
                  color: '#ffffff',
                  width: 3,
                  tool: 'pen',
                },
                // Red arrow annotation
                {
                  id: 'stroke-4',
                  points: [
                    { x: 120, y: 150, pressure: 0.6 },
                    { x: 150, y: 130, pressure: 0.7 },
                    { x: 180, y: 150, pressure: 0.6 },
                  ],
                  color: '#ff4444',
                  width: 4,
                  tool: 'pen',
                },
                // X in red
                {
                  id: 'stroke-5',
                  points: [
                    { x: 140, y: 160, pressure: 0.6 },
                    { x: 160, y: 180, pressure: 0.6 },
                  ],
                  color: '#ff4444',
                  width: 4,
                  tool: 'pen',
                },
                {
                  id: 'stroke-6',
                  points: [
                    { x: 160, y: 160, pressure: 0.6 },
                    { x: 140, y: 180, pressure: 0.6 },
                  ],
                  color: '#ff4444',
                  width: 4,
                  tool: 'pen',
                },
                // "2" fraction line in red
                {
                  id: 'stroke-7',
                  points: [
                    { x: 175, y: 165, pressure: 0.6 },
                    { x: 195, y: 165, pressure: 0.6 },
                  ],
                  color: '#ff4444',
                  width: 3,
                  tool: 'pen',
                },
              ],
              textBoxes: [
                {
                  id: 'text-1',
                  x: 280,
                  y: 180,
                  width: 350,
                  height: 40,
                  content: 'this is our Ron Resistance',
                  fontSize: 18,
                  color: '#ffffff',
                },
                {
                  id: 'text-2',
                  x: 280,
                  y: 280,
                  width: 200,
                  height: 30,
                  content: 'to ensure NMOS has the same thing',
                  fontSize: 14,
                  color: '#cccccc',
                },
              ],
              importedFiles: [],
              background: 'blank',
            },
            {
              id: 'page-1-3-4',
              title: 'Quiz 4 Review',
              lastModified: dayAgo,
              strokes: [],
              textBoxes: [],
              importedFiles: [],
              background: 'grid',
            },
          ],
        },
        {
          id: 'section-1-4',
          title: 'ENG M 401',
          isExpanded: false,
          pages: [
            {
              id: 'page-1-4-1',
              title: 'Project Management',
              lastModified: weekAgo,
              strokes: [],
              textBoxes: [],
              importedFiles: [],
              background: 'blank',
            },
          ],
        },
        {
          id: 'section-1-5',
          title: 'ECE 410',
          isExpanded: false,
          pages: [
            {
              id: 'page-1-5-1',
              title: 'Signal Processing',
              lastModified: dayAgo,
              strokes: [],
              textBoxes: [],
              importedFiles: [],
              background: 'lined',
            },
          ],
        },
      ],
    },
    {
      id: 'notebook-2',
      title: 'Third_Year_sem1',
      color: '#e67e22',
      isExpanded: false,
      sections: [
        {
          id: 'section-2-1',
          title: 'ECE 301',
          isExpanded: false,
          pages: [
            {
              id: 'page-2-1-1',
              title: 'Signals and Systems',
              lastModified: weekAgo,
              strokes: [],
              textBoxes: [],
              importedFiles: [],
              background: 'blank',
            },
          ],
        },
        {
          id: 'section-2-2',
          title: 'MATH 311',
          isExpanded: false,
          pages: [
            {
              id: 'page-2-2-1',
              title: 'Linear Algebra Review',
              lastModified: weekAgo,
              strokes: [],
              textBoxes: [],
              importedFiles: [],
              background: 'grid',
            },
          ],
        },
      ],
    },
    {
      id: 'notebook-3',
      title: 'Downloads',
      color: '#3498db',
      isExpanded: false,
      sections: [
        {
          id: 'section-3-1',
          title: 'References',
          isExpanded: false,
          pages: [
            {
              id: 'page-3-1-1',
              title: 'Textbook Notes',
              lastModified: weekAgo,
              strokes: [],
              textBoxes: [],
              importedFiles: [],
              background: 'blank',
            },
          ],
        },
      ],
    },
    {
      id: 'notebook-4',
      title: "Maanas's Notebook",
      color: '#27ae60',
      isExpanded: false,
      sections: [
        {
          id: 'section-4-1',
          title: 'Personal Notes',
          isExpanded: false,
          pages: [
            {
              id: 'page-4-1-1',
              title: 'Ideas',
              lastModified: dayAgo,
              strokes: [],
              textBoxes: [],
              importedFiles: [],
              background: 'blank',
            },
          ],
        },
      ],
    },
  ];
};
