const Notification = require('../models/Notification');

const createNotification = async (recipient, type, title, message, data = null, relatedEntity = null, relatedEntityId = null) => {
  try {
    await Notification.create({
      recipient,
      type,
      title,
      message,
      data,
      relatedEntity,
      relatedEntityId
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

const listNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { recipient: req.userId };

    if (req.query.isRead !== undefined) {
      query.isRead = req.query.isRead === 'true';
    }

    if (req.query.type) {
      query.type = req.query.type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: req.userId, isRead: false })
    ]);

    res.success({
      notifications,
      pagination: {
        page,
        limit,
        total,
        last_page: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.userId
    });

    if (!notification) {
      return res.error('Notification not found', 404);
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.success(notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.success({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.userId
    });

    if (!notification) {
      return res.error('Notification not found', 404);
    }

    await notification.deleteOne();

    res.success({ message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotification,
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
