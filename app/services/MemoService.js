const Memo = require('../../models/Memo');
const { createNotification } = require('./NotificationService');

function baseFilter(userId) {
  return {
    userId,
    deletedAt: null,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }], // 過期自動過濾
  };
}

async function createMemo(userId, data) {
  const memo = await Memo.create({ userId, ...data });
  await createNotification(userId, 'memo.created', { memoId: memo._id });
  return memo;
}

async function listMemos(userId, opts) {
  const {
    page = 1,
    pageSize = 10,
    label,
    unread,
    sort = 'createdAt',
    order = 'desc',
    includeExpired,
    search
  } = opts;

  const and = [{ userId, deletedAt: null }];

  // expiry rule
  const showExpired = includeExpired === 'true' || includeExpired === true;
  if (!showExpired) {
    and.push({ $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] });
  }

  if (label) and.push({ label });
  if (typeof unread !== 'undefined') {
    and.push({ unread: unread === 'true' || unread === true });
  }

  // optional: minimal search by regex (subject/body)
  if (search) {
    const rx = new RegExp(String(search), 'i');
    and.push({ $or: [{ subject: rx }, { body: rx }] });
  }

  const filter = and.length > 1 ? { $and: and } : and[0];

  const sortField = ['createdAt', 'subject'].includes(sort) ? sort : 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;

  const [total, data, unreadCount] = await Promise.all([
    Memo.countDocuments(filter),
    Memo.find(filter)
      .sort({ [sortField]: sortOrder, _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize))
      .lean(),
    Memo.countDocuments({
      userId,
      unread: true,
      deletedAt: null,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    }),
  ]);

  return {
    data,
    pageInfo: {
      page: Number(page),
      pageSize: Number(pageSize),
      total,
      hasNext: page * pageSize < total,
    },
    unreadCount,
  };
}

async function getMemoByIdAndAutoRead(userId, memoId) {
  const memo = await Memo.findOne({ _id: memoId, userId, deletedAt: null });
  if (!memo) return { status: 404, error: 'NOT_FOUND' };

  if (Memo.isExpired(memo)) return { status: 410, error: 'MEMO_EXPIRED' };

  if (memo.unread) {
    memo.unread = false;
    await memo.save();
  }
  return { status: 200, memo };
}

async function claimAttachment(userId, memoId) {
  const memo = await Memo.findOne({ _id: memoId, userId, deletedAt: null });
  if (!memo) return { status: 404, error: 'NOT_FOUND' };

  if (Memo.isExpired(memo)) return { status: 410, error: 'MEMO_EXPIRED' };

  if (!memo.attachments) return { status: 400, error: 'NO_ATTACHMENT' };

  if (memo.attachments.claimed) return { status: 409, error: 'ALREADY_CLAIMED' };

  memo.attachments.claimed = true;
  memo.attachments.claimedAt = new Date();
  await memo.save();

  return {
    status: 200,
    result: { memoId: memo._id, claimedAt: memo.attachments.claimedAt },
  };
}

module.exports = {
  createMemo,
  listMemos,
  getMemoByIdAndAutoRead,
  claimAttachment,
};
