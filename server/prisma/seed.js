const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive Fayaz Event Management database seed...');

  // Clean existing records in correct relation order
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Purged existing database records.');

  // Common password hash for test accounts
  const passwordHash = await bcrypt.hash('Password@123', 10);
  const fayazPasswordHash = await bcrypt.hash('Fayaz@123', 10);

  // 1. Create Core Users
  const userFayaz = await prisma.user.create({
    data: {
      email: 'fayaz@eventflow.io',
      name: 'Fayaz Ahmed',
      password: fayazPasswordHash,
      roleTitle: 'Executive Event Director & Founder',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Lead strategist and executive producer coordinating international tech conferences and corporate summits.',
      systemRole: 'ADMIN'
    }
  });

  const userSarah = await prisma.user.create({
    data: {
      email: 'sarah.chen@eventflow.io',
      name: 'Sarah Chen',
      password: passwordHash,
      roleTitle: 'Creative Stage & AV Director',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'Visual production specialist with 8+ years designing immersive audio-visual environments and stage sets.',
      systemRole: 'USER'
    }
  });

  const userAlex = await prisma.user.create({
    data: {
      email: 'alex.morgan@eventflow.io',
      name: 'Alex Morgan',
      password: passwordHash,
      roleTitle: 'Logistics & Venue Operations Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Master of crowd flow, city permits, freight handling, and physical security management.',
      systemRole: 'USER'
    }
  });

  const userPriya = await prisma.user.create({
    data: {
      email: 'priya.sharma@eventflow.io',
      name: 'Priya Sharma',
      password: passwordHash,
      roleTitle: 'VIP Hospitality & Sponsor Lead',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      bio: 'Managing C-suite speaker relations, brand integrations, and luxury hospitality lounges.',
      systemRole: 'USER'
    }
  });

  const userDavid = await prisma.user.create({
    data: {
      email: 'david.miller@eventflow.io',
      name: 'David Miller',
      password: passwordHash,
      roleTitle: 'Marketing & Digital Experience Manager',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      bio: 'Digital marketing strategist running attendee ticket campaigns, press relations, and mobile app rollouts.',
      systemRole: 'USER'
    }
  });

  console.log('✅ Created 5 team members.');

  // 2. Create Event Projects
  const project1 = await prisma.project.create({
    data: {
      title: 'Global AI & Cloud Summit 2026',
      slug: 'global-ai-cloud-summit-2026',
      description: 'Flagship international 3-day tech conference gathering 3,500+ developers, AI researchers, and Fortune 500 executives.',
      category: 'Conference',
      status: 'ACTIVE',
      eventDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // in 25 days
      venue: 'Metropolitan Convention Center, Grand Hall A & B',
      budget: 185000,
      color: '#4f46e5', // indigo
      ownerId: userFayaz.id,
      members: {
        create: [
          { userId: userFayaz.id, role: 'OWNER' },
          { userId: userSarah.id, role: 'ADMIN' },
          { userId: userAlex.id, role: 'MEMBER' },
          { userId: userPriya.id, role: 'MEMBER' },
          { userId: userDavid.id, role: 'MEMBER' }
        ]
      }
    }
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'Annual Corporate Gala & Innovation Awards',
      slug: 'annual-corporate-gala-2026',
      description: 'Black-tie evening celebration featuring dinner, award presentations, live orchestral music, and charity auction.',
      category: 'Corporate Gala',
      status: 'ACTIVE',
      eventDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // in 12 days
      venue: 'Grand Hyatt Waterfront Ballroom & Terrace',
      budget: 95000,
      color: '#059669', // emerald
      ownerId: userFayaz.id,
      members: {
        create: [
          { userId: userFayaz.id, role: 'OWNER' },
          { userId: userAlex.id, role: 'ADMIN' },
          { userId: userPriya.id, role: 'MEMBER' }
        ]
      }
    }
  });

  const project3 = await prisma.project.create({
    data: {
      title: 'Zenith Neon Music & Arts Festival',
      slug: 'zenith-neon-music-festival-2026',
      description: 'Outdoor dual-stage electronic music and immersive light installations festival for 10,000 attendees.',
      category: 'Music Festival',
      status: 'PLANNING',
      eventDate: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000), // in 65 days
      venue: 'Silver Valley Open Grounds & Amphitheater',
      budget: 320000,
      color: '#db2777', // pink
      ownerId: userFayaz.id,
      members: {
        create: [
          { userId: userFayaz.id, role: 'OWNER' },
          { userId: userSarah.id, role: 'ADMIN' },
          { userId: userDavid.id, role: 'MEMBER' }
        ]
      }
    }
  });

  const project4 = await prisma.project.create({
    data: {
      title: 'NextGen Autonomous Drone Product Reveal',
      slug: 'nextgen-drone-reveal-2026',
      description: 'Exclusive press launch, live flight demonstration cage, and worldwide livestream broadcast.',
      category: 'Product Launch',
      status: 'COMPLETED',
      eventDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      venue: 'Skyline Hangar 4 & Broadcast Stage',
      budget: 110000,
      color: '#d97706', // amber
      ownerId: userFayaz.id,
      members: {
        create: [
          { userId: userFayaz.id, role: 'OWNER' },
          { userId: userSarah.id, role: 'MEMBER' }
        ]
      }
    }
  });

  console.log('✅ Created 4 diverse Event Projects.');

  // 3. Create Tasks for Project 1 (Global AI Summit)
  // Task 1: Backlog
  const task1 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Design VIP Speaker Green Room & Luxury Hospitality Lounge',
      description: 'Curate high-end private lounge with ergonomic workstations, specialty espresso bar, and private teleprompter rehearsal booths.',
      status: 'BACKLOG',
      priority: 'MEDIUM',
      category: 'Speakers & VIP',
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      orderIndex: 0,
      assigneeId: userPriya.id,
      creatorId: userFayaz.id,
      checklist: {
        create: [
          { title: 'Rent mid-century modern lounge seating', isCompleted: false, orderIndex: 0 },
          { title: 'Contract artisanal barista station', isCompleted: false, orderIndex: 1 },
          { title: 'Install sound-dampening partitions', isCompleted: false, orderIndex: 2 }
        ]
      }
    }
  });

  // Task 2: To Do
  const task2 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Review Main Stage 4K Curved LED Wall Rigging Specs',
      description: 'Verify weight limits with convention center structural engineers. Ensure truss motorized hoists have redundant secondary safety cables.',
      status: 'TODO',
      priority: 'HIGH',
      category: 'AV & Tech',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      orderIndex: 0,
      assigneeId: userSarah.id,
      creatorId: userFayaz.id,
      checklist: {
        create: [
          { title: 'Obtain structural load certificate from venue', isCompleted: true, orderIndex: 0 },
          { title: 'Confirm 2.6mm pixel pitch LED tiles delivery', isCompleted: false, orderIndex: 1 },
          { title: 'Test redundant 12G-SDI video switcher routing', isCompleted: false, orderIndex: 2 },
          { title: 'Calibrate HDR display color profiles', isCompleted: false, orderIndex: 3 }
        ]
      }
    }
  });

  const task3 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Finalize Keynote Speaker Travel & 5-Star Hotel Accommodations',
      description: 'Lock in flights, executive Mercedes sprinter transfers, and suite reservations for 18 international keynote presenters.',
      status: 'TODO',
      priority: 'URGENT',
      category: 'Speakers & VIP',
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      orderIndex: 1,
      assigneeId: userPriya.id,
      creatorId: userFayaz.id,
      checklist: {
        create: [
          { title: 'Collect passport copies and dietary preferences', isCompleted: true, orderIndex: 0 },
          { title: 'Dispatch flight itineraries & e-tickets', isCompleted: true, orderIndex: 1 },
          { title: 'Schedule private airport chauffeur pickups', isCompleted: false, orderIndex: 2 }
        ]
      }
    }
  });

  // Task 4: In Progress
  const task4 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Deploy Attendee NFC Smart Badging & QR Check-in Kiosks',
      description: 'Set up 12 rapid self-serve iPad check-in pedestals with thermal badge printers to process 800 attendees per hour at main registration foyer.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      category: 'Operations',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      orderIndex: 0,
      assigneeId: userAlex.id,
      creatorId: userFayaz.id,
      checklist: {
        create: [
          { title: 'Load 4,000 custom NFC laminate badges', isCompleted: true, orderIndex: 0 },
          { title: 'Test offline sync mode on check-in tablets', isCompleted: true, orderIndex: 1 },
          { title: 'Conduct dry run with 50 volunteer staff members', isCompleted: false, orderIndex: 2 }
        ]
      }
    }
  });

  const task5 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Approve Stage Lighting Cue Sheet & Opening Ceremony Pyrotechnics',
      description: 'Program moving beam lights, haze atmosphere, and CO2 cryogenic jets for opening keynote countdown sequence.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      category: 'AV & Tech',
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      orderIndex: 1,
      assigneeId: userSarah.id,
      creatorId: userFayaz.id,
      checklist: {
        create: [
          { title: 'Timecode SMPTE synchronization test', isCompleted: true, orderIndex: 0 },
          { title: 'Fire marshal permit sign-off for atmospheric effects', isCompleted: false, orderIndex: 1 }
        ]
      }
    }
  });

  // Task 6: Review
  const task6 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'City Fire Safety Clearance & Emergency Evacuation Plan',
      description: 'Submit comprehensive aisle clearance diagrams, emergency exit signage map, and paramedic ambulance staging plan to city fire department.',
      status: 'REVIEW',
      priority: 'URGENT',
      category: 'Finance & Legal',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      orderIndex: 0,
      assigneeId: userAlex.id,
      creatorId: userFayaz.id,
      checklist: {
        create: [
          { title: 'Architectural crowd flow simulation', isCompleted: true, orderIndex: 0 },
          { title: 'On-site AED defibrillator and first-aid station locations', isCompleted: true, orderIndex: 1 },
          { title: 'Fire inspector final walk-through checklist', isCompleted: false, orderIndex: 2 }
        ]
      }
    }
  });

  // Task 7: Completed
  const task7 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Secure Convention Center Contract & Pay 50% Master Deposit',
      description: 'Finalize multi-hall commercial lease agreement with venue management and wire primary $55,000 reservation deposit.',
      status: 'COMPLETED',
      priority: 'HIGH',
      category: 'Finance & Legal',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      orderIndex: 0,
      assigneeId: userFayaz.id,
      creatorId: userFayaz.id,
      checklist: {
        create: [
          { title: 'Legal contract clause review', isCompleted: true, orderIndex: 0 },
          { title: 'Executive finance sign-off', isCompleted: true, orderIndex: 1 },
          { title: 'Wire transfer receipt verified by venue director', isCompleted: true, orderIndex: 2 }
        ]
      }
    }
  });

  const task8 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Launch Worldwide Digital Ticket Sales & Partner Promo Campaign',
      description: 'Publish official event website, Stripe ticketing gateway, and distribute early-bird discount codes to sponsor tech communities.',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      category: 'Marketing & PR',
      dueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      orderIndex: 1,
      assigneeId: userDavid.id,
      creatorId: userFayaz.id,
      checklist: {
        create: [
          { title: 'Set up Stripe checkout webhooks', isCompleted: true, orderIndex: 0 },
          { title: 'Email blast to 45,000 previous summit alumni', isCompleted: true, orderIndex: 1 },
          { title: 'Targeted LinkedIn & Twitter/X campaign rollout', isCompleted: true, orderIndex: 2 }
        ]
      }
    }
  });

  // Tasks for Project 2 (Corporate Gala)
  await prisma.task.create({
    data: {
      projectId: project2.id,
      title: 'Gourmet 5-Course Dinner Tasting with Executive Chef',
      description: 'Sample culinary selections, choose premium wine pairings, and confirm specialized dietary menus (Gluten-free, Vegan, Halal).',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      category: 'Catering & Hospitality',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      orderIndex: 0,
      assigneeId: userPriya.id,
      creatorId: userFayaz.id,
      checklist: {
        create: [
          { title: 'Appetizer course selection', isCompleted: true, orderIndex: 0 },
          { title: 'Main entree options (Halibut vs Wagyu)', isCompleted: true, orderIndex: 1 },
          { title: 'Sommelier wine pairing approval', isCompleted: false, orderIndex: 2 }
        ]
      }
    }
  });

  await prisma.task.create({
    data: {
      projectId: project2.id,
      title: 'Custom Crystal Innovation Trophy Engraving & Quality Audit',
      description: 'Inspect 14 hand-crafted geometric crystal awards to ensure recipient names, company logos, and year 2026 are flawlessly etched.',
      status: 'TODO',
      priority: 'MEDIUM',
      category: 'Operations',
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      orderIndex: 0,
      assigneeId: userAlex.id,
      creatorId: userFayaz.id
    }
  });

  console.log('✅ Created 10 realistic event tasks with subtasks.');

  // 4. Create Task Comments (Discussion Thread)
  await prisma.comment.createMany({
    data: [
      {
        taskId: task4.id,
        userId: userAlex.id,
        content: 'All 12 check-in stations have arrived at warehouse loading dock. Tablets tested at 98% battery health with thermal paper loaded.'
      },
      {
        taskId: task4.id,
        userId: userFayaz.id,
        content: 'Excellent work Alex. Please coordinate with Sarah to ensure the registration network has dedicated VLAN isolated from public guest Wi-Fi.'
      },
      {
        taskId: task4.id,
        userId: userSarah.id,
        content: 'Already provisioned! The registration VLAN is locked to 10Gbps fiber uplink with local cache failover if external DNS flickers.'
      },
      {
        taskId: task2.id,
        userId: userSarah.id,
        content: 'Truss load analysis report passed with 1.8x safety factor. Awaiting venue structural engineer stamp tomorrow morning.'
      },
      {
        taskId: task2.id,
        userId: userFayaz.id,
        content: 'Keep me updated immediately once stamped so we can release the rigging crew transport.'
      }
    ]
  });

  console.log('✅ Created task discussion comments.');

  // 5. Create Activity History Records (Audit Trail)
  await prisma.activity.createMany({
    data: [
      {
        projectId: project1.id,
        taskId: task4.id,
        userId: userAlex.id,
        action: 'STATUS_CHANGED',
        details: 'Moved task "Deploy Attendee NFC Smart Badging" to In Progress'
      },
      {
        projectId: project1.id,
        taskId: task4.id,
        userId: userAlex.id,
        action: 'CHECKLIST_TOGGLED',
        details: 'Checked off "Load 4,000 custom NFC laminate badges"'
      },
      {
        projectId: project1.id,
        taskId: task4.id,
        userId: userFayaz.id,
        action: 'COMMENTED',
        details: 'Posted comment on registration VLAN setup'
      },
      {
        projectId: project1.id,
        taskId: task7.id,
        userId: userFayaz.id,
        action: 'COMPLETED_TASK',
        details: 'Marked "Secure Convention Center Contract" as Completed'
      },
      {
        projectId: project1.id,
        taskId: task3.id,
        userId: userFayaz.id,
        action: 'ASSIGNED',
        details: 'Assigned "Finalize Keynote Speaker Travel" to Priya Sharma'
      }
    ]
  });

  console.log('✅ Created activity audit trail.');

  // 6. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: userFayaz.id,
        title: 'New Comment on Smart Badging',
        message: 'Sarah Chen replied: "Already provisioned! Registration VLAN is locked to 10Gbps fiber..."',
        type: 'COMMENT_ADDED',
        link: `/projects/${project1.id}/board`,
        isRead: false
      },
      {
        userId: userFayaz.id,
        title: 'Task Due Soon',
        message: 'City Fire Safety Clearance is due in 48 hours for Global AI Summit.',
        type: 'DEADLINE_ALERT',
        link: `/projects/${project1.id}/board`,
        isRead: false
      },
      {
        userId: userFayaz.id,
        title: 'New Team Member Joined',
        message: 'David Miller joined Zenith Neon Music & Arts Festival.',
        type: 'INFO',
        link: `/projects/${project3.id}`,
        isRead: true
      },
      {
        userId: userSarah.id,
        title: 'Task Assigned',
        message: 'Fayaz Ahmed assigned you to "Review Main Stage 4K Curved LED Wall Rigging Specs".',
        type: 'TASK_ASSIGNED',
        link: `/projects/${project1.id}/board`,
        isRead: false
      }
    ]
  });

  console.log('✅ Created real-time user notifications.');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
