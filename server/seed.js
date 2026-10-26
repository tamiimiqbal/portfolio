// Starter content. Everything here is placeholder text — edit it all from /admin.
const now = new Date().toISOString();
let n = 0;
const id = () => `seed_${(++n).toString(36)}_${Date.now().toString(36)}`;
const stamp = (o, i) => ({ id: id(), order: i, createdAt: now, updatedAt: now, ...o });

module.exports = () => ({
  profile: {
    name: 'Md Tamim Iqbal',
    shortName: 'Tamim',
    roles: ['Machine Learning Researcher', 'Full-Stack Engineer', 'Embedded Systems Builder', 'CSE Undergraduate'],
    tagline: 'I build intelligent systems — from research models to the robots and products that run them.',
    bio:
      "I'm a Computer Science & Engineering student who enjoys the space where research meets real engineering. " +
      'My work spans machine learning, computer vision, embedded systems and full-stack development. ' +
      "I'm preparing for graduate study abroad (MS/PhD) and actively looking for research collaborations.\n\n" +
      'Replace this paragraph from the admin panel with your own story — what drives you, what you research, and where you want to go.',
    location: 'Dhaka, Bangladesh',
    email: 'hello@example.com',
    avatar: '',
    cvUrl: '',
    availability: 'Open to MS/PhD positions & research collaborations — Fall 2027',
    researchInterests: ['Machine Learning', 'Computer Vision', 'Medical AI', 'Robotics', 'Embedded Intelligence'],
    stats: [
      { label: 'Projects built', value: '20+' },
      { label: 'Research papers', value: '3' },
      { label: 'CGPA', value: '3.85' },
      { label: 'Years coding', value: '5' }
    ],
    socials: {
      github: 'https://github.com/',
      linkedin: 'https://linkedin.com/in/',
      scholar: 'https://scholar.google.com/',
      researchgate: 'https://researchgate.net/',
      orcid: '',
      x: '',
      facebook: 'https://facebook.com/',
      instagram: '',
      youtube: '',
      kaggle: 'https://kaggle.com/'
    }
  },

  education: [
    {
      degree: 'B.Sc. in Computer Science & Engineering',
      institution: 'Your University',
      location: 'Dhaka, Bangladesh',
      start: '2023',
      end: 'Present',
      gpa: 'CGPA 3.85 / 4.00',
      details: 'Focus: Machine Learning, Robotics, Operating Systems, Numerical Methods.',
      highlights: ["Dean's List (sample)", 'Thesis: add your thesis title here']
    },
    {
      degree: 'Higher Secondary Certificate (HSC) — Science',
      institution: 'Your College',
      location: 'Dhaka, Bangladesh',
      start: '2020',
      end: '2022',
      gpa: 'GPA 5.00 / 5.00',
      details: '',
      highlights: []
    }
  ].map(stamp),

  scores: [
    { name: 'IELTS Academic', score: '7.5', detail: 'L 8.0 · R 8.0 · W 6.5 · S 7.0 (sample)', date: '2026' },
    { name: 'GRE General', score: '320', detail: 'Q 167 · V 153 · AWA 4.0 (sample)', date: '2026' }
  ].map(stamp),

  research: [
    {
      title: 'A Low-Cost Multi-Purpose Agricultural Robot (sample entry)',
      authors: 'Md Tamim Iqbal, Co-Author A, Supervisor B',
      venue: 'Conference / Journal name',
      year: '2026',
      status: 'Under Review',
      type: 'Conference',
      abstract:
        'Write a 2–4 sentence abstract here. Explain the problem, your method, and the key result in plain language.',
      doi: '',
      pdf: '',
      code: '',
      tags: ['Robotics', 'Embedded', 'IoT'],
      featured: true
    },
    {
      title: 'An Image Dataset for Classification Research (sample entry)',
      authors: 'Md Tamim Iqbal, Co-Author A',
      venue: 'Data in Brief',
      year: '2026',
      status: 'In Progress',
      type: 'Journal',
      abstract: 'Describe the dataset: what it contains, how it was collected, and what research it enables.',
      doi: '',
      pdf: '',
      code: '',
      tags: ['Computer Vision', 'Dataset'],
      featured: true
    }
  ].map(stamp),

  projects: [
    {
      title: 'Heat-Stress Risk Prediction',
      summary: 'ML system that predicts heat-stress risk from weather and demographic features.',
      description:
        '## Overview\nDescribe the problem, the data, the model and the impact.\n\n## Stack\n- Python, scikit-learn, XGBoost\n- Flask API + dashboard\n\n## Results\nAdd metrics like accuracy, F1, ROC-AUC.',
      category: 'Machine Learning',
      tags: ['Python', 'XGBoost', 'Flask'],
      image: '',
      github: 'https://github.com/',
      demo: '',
      year: '2026',
      featured: true
    },
    {
      title: 'Smart Delivery Robot',
      summary: 'ESP32 Wi-Fi robot that navigates and delivers items, controlled from a web dashboard.',
      description: '## Overview\nHardware, firmware, control logic and what you learned.',
      category: 'Robotics',
      tags: ['ESP32', 'C++', 'IoT'],
      image: '',
      github: 'https://github.com/',
      demo: '',
      year: '2026',
      featured: true
    },
    {
      title: 'CPU Scheduling Visualizer',
      summary: 'Interactive simulator for FCFS, SJF, Round Robin and Priority scheduling with Gantt charts.',
      description: '## Overview\nExplain the algorithms, the UI and how it helps learning.',
      category: 'Systems',
      tags: ['JavaScript', 'OS', 'Visualization'],
      image: '',
      github: 'https://github.com/',
      demo: '',
      year: '2026',
      featured: false
    },
    {
      title: 'This Portfolio',
      summary: 'Full-stack portfolio with a custom CMS, JWT auth and MongoDB/JSON storage.',
      description: '## Overview\nNode.js + Express backend, vanilla JS frontend, admin panel.',
      category: 'Web',
      tags: ['Node.js', 'Express', 'MongoDB'],
      image: '',
      github: 'https://github.com/',
      demo: '',
      year: '2026',
      featured: false
    }
  ].map(stamp),

  experience: [
    {
      role: 'Undergraduate Research Assistant',
      org: 'Your University — AI Lab',
      type: 'Research',
      location: 'Dhaka',
      start: 'Jan 2026',
      end: 'Present',
      description: 'What you research, with whom, and what you achieved.'
    },
    {
      role: 'Team Lead — Robotics Project',
      org: 'University Robotics Lab',
      type: 'Leadership',
      location: 'Dhaka',
      start: '2025',
      end: '2026',
      description: 'Led hardware integration and firmware for a team robot project.'
    }
  ].map(stamp),

  skills: [
    { group: 'Machine Learning', items: ['PyTorch', 'TensorFlow', 'scikit-learn', 'XGBoost', 'OpenCV', 'Pandas'] },
    { group: 'Languages', items: ['Python', 'C / C++', 'JavaScript', 'TypeScript', 'Java', 'SQL'] },
    { group: 'Web & Backend', items: ['Node.js', 'Express', 'React', 'MongoDB', 'REST APIs', 'Docker'] },
    { group: 'Embedded & Robotics', items: ['Arduino', 'ESP32', 'Sensors', 'Motor control', 'Proteus'] },
    { group: 'Research Tools', items: ['LaTeX', 'Overleaf', 'Git', 'Jupyter', 'Zotero'] }
  ].map(stamp),

  achievements: [
    { title: 'Sample Award — Hackathon Finalist', issuer: 'Organizer', year: '2025', kind: 'Award', description: '', link: '' },
    { title: 'Machine Learning Specialization', issuer: 'Coursera / DeepLearning.AI', year: '2025', kind: 'Certification', description: '', link: '' },
    { title: 'Merit Scholarship', issuer: 'Your University', year: '2024', kind: 'Scholarship', description: '', link: '' }
  ].map(stamp),

  posts: [
    {
      title: 'Hello world — why I built this site',
      slug: 'hello-world',
      excerpt: 'A short note on what I will write about here: research notes, project breakdowns and grad-school prep.',
      cover: '',
      tags: ['Meta'],
      published: true,
      date: now.slice(0, 10),
      content:
        '# Hello world\n\nThis is a sample blog post written in **Markdown**. Edit or delete it from the admin panel.\n\n## What I will write about\n- Research notes and paper summaries\n- Project build logs\n- Grad-school application journey\n\n```python\nprint("Hello, research!")\n```\n\n> Tip: you can use headings, lists, links, images, code blocks and quotes.'
    }
  ].map(stamp),

  messages: []
});
