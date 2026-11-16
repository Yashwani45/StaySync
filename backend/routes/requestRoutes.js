const express = require('express');
const router = express.Router();
const { getRequests, createRequest, updateRequestStatus } = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getRequests)
  .post(protect, createRequest);

router.route('/:id')
  .put(protect, updateRequestStatus);

module.exports = router;
