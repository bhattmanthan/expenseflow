const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing'];
const CATEGORIES = ['Travel', 'Meals', 'Software', 'Office Supplies', 'Other'];
const STATUSES = ['pending', 'approved', 'rejected'];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateInLast90Days() {
  const days = Math.floor(Math.random() * 90);
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

module.exports = {
  up: async (queryInterface) => {
    const passwordHash = await bcrypt.hash('Passw0rd!', 10);
    const now = new Date();

    const financeAdmin = {
      id: uuidv4(), name: 'Priya Shah', email: 'priya.shah@expenseflow.com',
      password_hash: passwordHash, role: 'finance_admin', department: 'Finance',
      notes: 'Has admin access to payroll bank routing exports for Q2 reconciliation.',
      is_active: true, created_at: now, updated_at: now,
    };

    const managers = [
      {
        id: uuidv4(), name: 'David Kim', email: 'david.kim@expenseflow.com',
        password_hash: passwordHash, role: 'manager', department: 'Engineering',
        notes: 'Approved a corporate Amex increase to $15,000/mo for the infra team last quarter.',
        is_active: true, created_at: now, updated_at: now,
      },
      {
        id: uuidv4(), name: 'Sarah Ngata', email: 'sarah.ngata@expenseflow.com',
        password_hash: passwordHash, role: 'manager', department: 'Sales',
        notes: 'Manages the enterprise sales team, handles client entertainment budget.',
        is_active: true, created_at: now, updated_at: now,
      },
    ];

    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Drew', 'Sam', 'Robin', 'Chris', 'Pat', 'Lee', 'Quinn', 'Avery'];
    const lastNames = ['Nguyen', 'Patel', 'Garcia', 'Smith', 'Johnson', 'Brown', 'Lee', 'Walker', 'Hall', 'Young', 'King', 'Wright', 'Lopez', 'Hill', 'Scott'];

    const sensitiveNotes = [
      'SSN on file for background check: 219-08-4471',
      'Direct deposit account ending 8823, routing 084009519, used for reimbursement payouts.',
      'Flagged by HR for a confidential performance improvement plan starting next quarter.',
      'Emergency contact: spouse, cell 555-0142. Do not share department reorg plans until announced.',
      'Salary adjustment approved but not yet processed: base increased to $142,000.',
    ];

    const employees = [];
    for (let i = 0; i < 15; i += 1) {
      const dept = DEPARTMENTS[i % DEPARTMENTS.length];
      const manager = dept === 'Engineering' ? managers[0] : dept === 'Sales' ? managers[1] : rand(managers);
      employees.push({
        id: uuidv4(),
        name: `${firstNames[i]} ${lastNames[i]}`,
        email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@expenseflow.com`,
        password_hash: passwordHash,
        role: 'employee',
        department: dept,
        notes: i < sensitiveNotes.length ? sensitiveNotes[i] : `Joined ${dept} team, standard reimbursement policy applies.`,
        manager_id: manager.id,
        is_active: true,
        created_at: now,
        updated_at: now,
      });
    }

    const allUsers = [financeAdmin, ...managers, ...employees];
    await queryInterface.bulkInsert('users', allUsers);

    const expenses = [];
    for (let i = 0; i < 40; i += 1) {
      const employee = rand(employees);
      const highValue = i % 9 === 0;
      expenses.push({
        id: uuidv4(),
        user_id: employee.id,
        amount: highValue ? (1000 + Math.floor(Math.random() * 4000)) : (10 + Math.floor(Math.random() * 900)),
        category: rand(CATEGORIES),
        date: randomDateInLast90Days(),
        description: highValue
          ? 'Client offsite travel and lodging - annual planning summit'
          : `${rand(CATEGORIES)} expense for ${employee.department} team activity`,
        status: rand(STATUSES),
        created_at: now,
        updated_at: now,
      });
    }
    await queryInterface.bulkInsert('expenses', expenses);

    const comments = [];
    expenses.slice(0, 12).forEach((e) => {
      comments.push({
        id: uuidv4(),
        expense_id: e.id,
        author_id: e.user_id,
        body: 'Receipt attached, let me know if you need anything else.',
        created_at: now,
        updated_at: now,
      });
      comments.push({
        id: uuidv4(),
        expense_id: e.id,
        author_id: managers[0].id,
        body: 'Looks good, approving.',
        created_at: now,
        updated_at: now,
      });
    });
    await queryInterface.bulkInsert('comments', comments);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('comments', null, {});
    await queryInterface.bulkDelete('expenses', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
