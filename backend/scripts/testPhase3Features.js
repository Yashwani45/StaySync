const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');

const User = require('../models/User');
const Property = require('../models/Property');
const Request = require('../models/Request');
const Payment = require('../models/Payment');
const Refund = require('../models/Refund');
const Settlement = require('../models/Settlement');
const MaintenanceTicket = require('../models/MaintenanceTicket');
const RentSchedule = require('../models/RentSchedule');
const RentalAgreement = require('../models/RentalAgreement');
const Inspection = require('../models/Inspection');
const CommunityPost = require('../models/CommunityPost');

async function testNewFeatures() {
  console.log('========================================================');
  console.log('  Testing StaySync 3.0 Advanced Modules Verification');
  console.log('========================================================');

  await connectDB();
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
    }
  }

  // 1. Refunds & Cancellations
  const refunds = await Refund.find({});
  assert(refunds !== null, 'Refund model initialized and accessible');

  // 2. Settlements & Commission
  const settlements = await Settlement.find({});
  assert(settlements.length > 0, 'Settlement ledger records exist with commission calculation');
  if (settlements.length > 0) {
    assert(settlements[0].platformCommissionRate === 5, 'Platform commission rate defaults correctly to 5%');
    assert(settlements[0].status === 'Settled', 'Settlement status tracks verified payout');
  }

  // 3. Maintenance Tickets
  const tickets = await MaintenanceTicket.find({});
  assert(tickets.length >= 2, 'Maintenance tickets created across categories (Plumbing, Internet)');
  const inProgressTicket = tickets.find(t => t.status === 'In Progress');
  assert(inProgressTicket && inProgressTicket.assignedTo?.name, 'Technician assignment and status tracking operational');

  // 4. Rent Schedules & Collections
  const rentSchedules = await RentSchedule.find({});
  assert(rentSchedules.length >= 2, 'Rent schedule tracks monthly installments');
  const paidRent = rentSchedules.find(r => r.status === 'Paid');
  assert(paidRent && paidRent.receiptNumber, 'Paid rent generates formal receipt reference');

  // 5. Digital Rental Agreements
  const agreements = await RentalAgreement.find({});
  assert(agreements.length > 0, 'Digital rental agreement generated with terms');
  if (agreements.length > 0) {
    assert(agreements[0].termsAndConditions.length >= 5, 'Agreement contains comprehensive house rules and legal terms');
    assert(agreements[0].tenantAcknowledged === true, 'Digital acknowledgment recorded for tenant');
  }

  // 6. Move-In / Move-Out Inspections
  const inspections = await Inspection.find({});
  assert(inspections.length > 0, 'Move-in inspection checklist created');
  if (inspections.length > 0) {
    assert(inspections[0].depositAmount > 0, 'Deposit recorded for refund calculation');
    assert(inspections[0].tenantConfirmed === true, 'Tenant room condition confirmation recorded');
  }

  // 7. Community Board
  const posts = await CommunityPost.find({});
  assert(posts.length >= 3, 'Community board posts created across Announcement, Event, Discussion');
  const pinnedPost = posts.find(p => p.pinned);
  assert(pinnedPost && pinnedPost.type === 'Announcement', 'Administrator announcements properly pinned');

  console.log('========================================================');
  console.log(`  STAYSYNC 3.0 VERIFICATION: ${passed} / ${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================================');
  process.exit(passed === total ? 0 : 1);
}

testNewFeatures().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
