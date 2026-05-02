require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  try {
    const userRes = await pool.query("SELECT id FROM users WHERE email = 'liju5035@gmail.com'");
    if (userRes.rows.length === 0) {
      console.log("User liju5035@gmail.com not found.");
      return;
    }
    const teacherId = userRes.rows[0].id;
    
    // Check if group already exists for this teacher
    let groupRes = await pool.query("SELECT id FROM study_groups WHERE teacher_id = $1", [teacherId]);
    if (groupRes.rows.length === 0) {
      groupRes = await pool.query("INSERT INTO study_groups (teacher_id, name, description) VALUES ($1, 'Kelompok Tahsin A', 'Kelompok bimbingan Ustadz Liju') RETURNING id", [teacherId]);
    }
    const groupId = groupRes.rows[0].id;

    console.log("Using Group ID: ", groupId);

    // Create Students
    const studentNames = ['Ahmad Faiz', 'Bima Santoso', 'Cici Kirana', 'Dodi Al-Fayed', 'Eka Putri'];
    const studentIds = [];
    for (const name of studentNames) {
       const sRes = await pool.query("INSERT INTO students (group_id, name, slug) VALUES ($1, $2, $3) RETURNING id", [groupId, name, name.toLowerCase().replace(/ /g, '-') + '-' + Math.floor(Math.random()*1000)]);
       studentIds.push(sRes.rows[0].id);
    }

    console.log("Created Students: ", studentIds);

    // Insert Attendance History (Past 3 days)
    const statuses = ['HADIR', 'HADIR', 'HADIR', 'SAKIT', 'IZIN', 'ALPA'];
    for (let i = 1; i <= 3; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        for (const sid of studentIds) {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            await pool.query("INSERT INTO attendance (student_id, teacher_id, date, status, notes) VALUES ($1, $2, $3, $4, 'Seeding data')", [sid, teacherId, dateStr, status]);
        }
    }
    console.log("Seeding complete!");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

seed();
