const Interview = require('../../models/HR/Interview');
const Application = require('../../models/HR/Application');
const Candidate = require('../../models/HR/Candidate');
const User = require('../../models/user_settings/User');
const notificationService = require('../../services/notificationService');
const auditService = require('../../services/auditService');
const calendarService = require('../../services/calendarService');
const emailService = require('../../services/emailService');
const mongoose = require('mongoose');

// In interviewController.js, add this helper function at the top
const generateInterviewId = async () => {
  const Interview = require('../../models/HR/Interview');
  const year = new Date().getFullYear();
  const count = await Interview.countDocuments({
    interviewId: new RegExp(`INT-${year}-`, 'i')
  });
  return `INT-${year}-${(count + 1).toString().padStart(5, '0')}`;
};

const scheduleInterview = async (req, res) => {
  try {
    const {
      applicationId,
      round,
      interviewers,
      scheduledAt,
      duration,
      type,
      location,
      meetingLink
    } = req.body;

    if (!applicationId || !round || !interviewers || !scheduledAt || !type) {
      return res.status(400).json({
        success: false,
        message: 'Application ID, round, interviewers, scheduled time, and type are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format'
      });
    }

    const application = await Application.findById(applicationId)
      .populate('candidateId')
      .populate('jobId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.status !== 'shortlisted') {
      return res.status(400).json({
        success: false,
        message: `Cannot schedule interview. Application status must be 'shortlisted' to schedule an interview. Current status: ${application.status}`
      });
    }

    const interviewerIds = interviewers.map(i => i.interviewerId);
    const interviewersList = await User.find({ _id: { $in: interviewerIds } })
      .populate('EmployeeID');

    const availabilityCheck = await calendarService.checkAvailability(
      interviewersList.map(i => i.EmployeeID?.Email).filter(Boolean),
      new Date(scheduledAt),
      duration || 60
    );

    if (!availabilityCheck.available) {
      return res.status(400).json({
        success: false,
        message: 'Interviewer not available at the scheduled time',
        conflicts: availabilityCheck.conflicts
      });
    }

    const interviewId = await generateInterviewId();

    const interviewData = {
      interviewId,
      applicationId: application._id,
      candidateId: application.candidateId._id,
      jobId: application.jobId._id,
      round,
      interviewers: interviewers.map(i => ({
        interviewerId: i.interviewerId,
        name: i.name,
        email: i.email
      })),
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      type,
      location,
      meetingLink,
      status: 'scheduled',
      createdBy: req.user._id
    };

    console.log('Creating interview with data:', interviewData);

    const interview = await Interview.create(interviewData);

    const calendarEvents = await calendarService.createInterviewEvents(interview, application);
    interview.calendarEvents = calendarEvents;
    await interview.save();

    application.interviews.push(interview._id);
    application.status = 'interview_scheduled';
    application.statusHistory.push({
      status: 'interview_scheduled',
      changedBy: req.user._id,
      changedByName: req.user.Username || 'HR',
      changedAt: new Date(),
      notes: `${round} round scheduled`
    });
    await application.save();

    const candidate = await Candidate.findById(application.candidateId._id);
    if (candidate && candidate.status === 'shortlisted') {
      candidate.status = 'interviewed';
      await candidate.save();
    }

    await emailService.sendInterviewInvitation(interview, application);

    const candidateUser = await User.findOne({ Email: application.candidateId.email });
    if (candidateUser) {
      await notificationService.createNotification({
        userId: candidateUser._id,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: `Your ${round} interview for ${application.jobId.title} has been scheduled`,
        data: {
          interviewId: interview._id,
          applicationId: application._id,
          candidateId: application.candidateId._id,
          jobTitle: application.jobId.title,
          scheduledAt: interview.scheduledAt,
          link: `/interviews/${interview._id}`
        }
      });
    }

    for (const interviewer of interviewers) {
      await notificationService.createNotification({
        userId: interviewer.interviewerId,
        type: 'interview_scheduled',
        title: 'Interview Assigned',
        message: `You have been assigned as interviewer for ${application.candidateId.firstName} ${application.candidateId.lastName} - ${application.jobId.title}`,
        data: {
          interviewId: interview._id,
          applicationId: application._id,
          candidateName: `${application.candidateId.firstName} ${application.candidateId.lastName}`,
          jobTitle: application.jobId.title,
          scheduledAt: interview.scheduledAt,
          link: `/interviews/${interview._id}`
        }
      });
    }

    await auditService.log(
      'SCHEDULE',
      'Interview',
      interview._id,
      req.user,
      { interviewData },
      req
    );

    res.status(201).json({
      success: true,
      data: interview,
      message: 'Interview scheduled successfully'
    });

  } catch (error) {
    console.error('Schedule interview error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate interview ID. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Reschedule interview
// @route   PUT /api/interviews/:id/reschedule
// @access  Private (HR only)
const rescheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt, reason } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'New scheduled time is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format'
      });
    }

    const interview = await Interview.findById(id)
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'candidateId' },
          { path: 'jobId' }
        ]
      });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule interview with status: ${interview.status}`
      });
    }

    const previousTime = interview.scheduledAt;
    interview.scheduledAt = new Date(scheduledAt);
    interview.status = 'rescheduled';
    await interview.save();

    await calendarService.updateInterviewEvents(interview, previousTime);

    const candidateUser = await User.findOne({ Email: interview.applicationId.candidateId.email });
    if (candidateUser) {
      await notificationService.createNotification({
        userId: candidateUser._id,
        type: 'interview_scheduled',
        title: 'Interview Rescheduled',
        message: `Your interview has been rescheduled to ${new Date(scheduledAt).toLocaleString()}. Reason: ${reason || 'Schedule change'}`,
        data: {
          interviewId: interview._id,
          applicationId: interview.applicationId._id,
          scheduledAt: interview.scheduledAt,
          link: `/interviews/${interview._id}`
        }
      });
    }

    for (const interviewer of interview.interviewers) {
      await notificationService.createNotification({
        userId: interviewer.interviewerId,
        type: 'interview_scheduled',
        title: 'Interview Rescheduled',
        message: `Interview with ${interview.applicationId.candidateId.firstName} ${interview.applicationId.candidateId.lastName} has been rescheduled`,
        data: {
          interviewId: interview._id,
          applicationId: interview.applicationId._id,
          scheduledAt: interview.scheduledAt,
          link: `/interviews/${interview._id}`
        }
      });
    }

    await emailService.sendInterviewReschedule(interview, reason);

    res.json({
      success: true,
      data: interview,
      message: 'Interview rescheduled successfully'
    });

  } catch (error) {
    console.error('Reschedule interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Cancel interview
// @route   POST /api/interviews/:id/cancel
// @access  Private (HR, SuperAdmin/CEO)
const cancelInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format'
      });
    }

    const interview = await Interview.findById(id)
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'candidateId' },
          { path: 'jobId' }
        ]
      });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Interview is already cancelled'
      });
    }

    interview.status = 'cancelled';
    await interview.save();

    await calendarService.deleteInterviewEvents(interview);

    const application = interview.applicationId;
    application.status = 'shortlisted';
    application.statusHistory.push({
      status: 'shortlisted',
      changedBy: req.user._id,
      changedByName: req.user.Username || 'HR',
      changedAt: new Date(),
      notes: `Interview cancelled: ${reason || 'No reason provided'}`
    });
    await application.save();

    const candidateUser = await User.findOne({ Email: application.candidateId.email });
    if (candidateUser) {
      await notificationService.createNotification({
        userId: candidateUser._id,
        type: 'interview_scheduled',
        title: 'Interview Cancelled',
        message: `Your interview has been cancelled. Reason: ${reason || 'Schedule conflict'}`,
        data: {
          interviewId: interview._id,
          applicationId: application._id,
          link: `/applications/${application._id}`
        }
      });
    }

    await emailService.sendInterviewCancellation(interview, reason);

    res.json({
      success: true,
      message: 'Interview cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Submit interview feedback
// @route   POST /api/interviews/:id/feedback
// @access  Private (Interviewer only)
const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { ratings, comments, strengths, weaknesses, decision } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format'
      });
    }

    const interview = await Interview.findById(id)
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'candidateId' },
          { path: 'jobId' }
        ]
      });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    const isInterviewer = interview.interviewers.some(
      i => i.interviewerId.toString() === req.user._id.toString()
    );

    if (!isInterviewer && req.user.RoleName !== 'SuperAdmin' && req.user.RoleName !== 'CEO' && req.user.RoleName !== 'HR') {
      return res.status(403).json({
        success: false,
        message: 'Only assigned interviewers can submit feedback'
      });
    }

    if (interview.feedback && interview.feedback.submittedAt) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already submitted for this interview'
      });
    }

    let overallRating = ratings?.overall;
    if (!overallRating && ratings) {
      const ratingValues = Object.values(ratings).filter(r => typeof r === 'number');
      overallRating = ratingValues.length > 0
        ? Math.round(ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length)
        : 3;
    }

    interview.feedback = {
      ratings: {
        technical: ratings?.technical || 3,
        communication: ratings?.communication || 3,
        problemSolving: ratings?.problemSolving || 3,
        culturalFit: ratings?.culturalFit || 3,
        overall: overallRating || 3
      },
      comments,
      strengths,
      weaknesses,
      decision,
      submittedBy: req.user._id,
      submittedAt: new Date()
    };

    interview.status = 'completed';
    await interview.save();

    const application = interview.applicationId;
    if (decision === 'select') {
      application.status = 'selected'; 
    } else if (decision === 'reject') {
      application.status = 'rejected';
    } else if (decision === 'hold') {
      application.status = 'onHold';
    } else {
      application.status = 'interviewed'; 
    }
    
    application.statusHistory.push({
      status: application.status,
      changedBy: req.user._id,
      changedByName: req.user.Username || 'Interviewer',
      changedAt: new Date(),
      notes: `Interview feedback submitted: ${decision || 'No decision'}`
    });
    await application.save();

    const candidate = await Candidate.findById(interview.candidateId);
    if (candidate) {
      if (decision === 'select') {
        candidate.status = 'selected';
      } else if (decision === 'reject') {
        candidate.status = 'rejected';
      } else if (decision === 'hold') {
        candidate.status = 'onHold';
      } else {
        candidate.status = 'interviewed';
      }
      await candidate.save();
    }

    const hrUsers = await User.find()
      .populate({
        path: 'RoleID',
        match: { RoleName: 'HR' }
      })
      .select('_id');

    for (const hr of hrUsers) {
      if (hr.RoleID) {
        await notificationService.createNotification({
          userId: hr._id,
          type: 'feedback_submitted',
          title: 'Interview Feedback Submitted',
          message: `Feedback submitted for ${application.candidateId.firstName} ${application.candidateId.lastName} - ${interview.round} round`,
          data: {
            interviewId: interview._id,
            applicationId: application._id,
            candidateName: `${application.candidateId.firstName} ${application.candidateId.lastName}`,
            decision,
            link: `/interviews/${interview._id}`
          }
        });
      }
    }

    await auditService.log(
      'FEEDBACK',
      'Interview',
      interview._id,
      req.user,
      { decision, ratings },
      req
    );

    res.json({
      success: true,
      data: interview,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get interviews
// @route   GET /api/interviews
// @access  Private
const getInterviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      fromDate,
      toDate,
      interviewerId,
      sortBy = 'scheduledAt',
      sortOrder = 'asc'
    } = req.query;

    const filter = {};

    if (status) filter.status = status;

    if (fromDate || toDate) {
      filter.scheduledAt = {};
      if (fromDate) filter.scheduledAt.$gte = new Date(fromDate);
      if (toDate) filter.scheduledAt.$lte = new Date(toDate);
    }

    if (interviewerId) {
      filter['interviewers.interviewerId'] = mongoose.Types.ObjectId(interviewerId);
    } else if (req.user.RoleName !== 'SuperAdmin' && req.user.RoleName !== 'CEO' && req.user.RoleName !== 'HR') {
      filter['interviewers.interviewerId'] = req.user._id;
    }

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [interviews, totalCount] = await Promise.all([
      Interview.find(filter)
        .populate({
          path: 'applicationId',
          populate: [
            { path: 'candidateId', select: 'firstName lastName email phone' },
            { path: 'jobId', select: 'title jobId' }
          ]
        })
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Interview.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: interviews,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / pageSize),
        totalItems: totalCount,
        itemsPerPage: pageSize
      }
    });

  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get interview by ID
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format'
      });
    }

    const interview = await Interview.findById(id)
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'candidateId' },
          { path: 'jobId' }
        ]
      })
      .populate('interviewers.interviewerId', 'Username Email')
      .populate('createdBy', 'Username Email')
      .populate('feedback.submittedBy', 'Username Email');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    res.json({
      success: true,
      data: interview
    });

  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ✅ NEW: @desc    Bulk delete interviews
// @route   DELETE /api/interviews/bulk
// @access  Private (HR/SuperAdmin)
const bulkDeleteInterviews = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No interviews selected for deletion'
      });
    }

    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid interview IDs provided'
      });
    }

    // Find all interviews for audit logging
    const interviews = await Interview.find({ _id: { $in: validIds } });

    if (interviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No interviews found with the given IDs'
      });
    }

    // Delete interviews
    const result = await Interview.deleteMany({ _id: { $in: validIds } });

    // Remove interview references from applications
    await Application.updateMany(
      { interviews: { $in: validIds } },
      { $pull: { interviews: { $in: validIds } } }
    );

    // Log audit for each
    for (const interview of interviews) {
      try {
        await auditService.log(
          'DELETE',
          'Interview',
          interview._id,
          req.user,
          {
            interviewId: interview.interviewId,
            candidateId: interview.candidateId,
            action: 'bulk_delete'
          },
          req
        );
      } catch (auditErr) {
        console.warn('Audit log failed for', interview._id, auditErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} interview(s) deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('❌ Bulk delete interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

module.exports = {
  scheduleInterview,
  rescheduleInterview,
  cancelInterview,
  submitFeedback,
  getInterviews,
  getInterviewById,
  bulkDeleteInterviews // ✅ Added
};