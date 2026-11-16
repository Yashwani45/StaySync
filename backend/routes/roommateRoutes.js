const express = require('express');
const router = express.Router();
const { 
  getRoommates, 
  getRoommateProfile, 
  getRoommateMatches, 
  reportRoommate 
} = require('../controllers/roommateController');
const { protect } = require('../middleware/auth');

router.get('/matches', protect, getRoommateMatches);
router.post('/report', protect, reportRoommate);
router.get('/', getRoommates);
router.get('/:id', getRoommateProfile);

module.exports = router;
