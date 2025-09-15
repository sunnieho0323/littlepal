// app/services/MemoService.js
const Memo = require('../../models/Memo');
const { createNotification } = require('./NotificationService');

function baseFilter(userId) {
  return {
    userId,
    deletedAt: null,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
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
  } = opts || {};

  // ✅ 接受 q 或 search
  const search = (opts?.search ?? opts?.q ?? '').toString().trim();

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

  // ✅ 最小全文搜尋（subject/body）
  if (search) {
    const rx = new RegExp(search, 'i');
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

  // 無附件
  if (!memo.attachments || (Array.isArray(memo.attachments) && memo.attachments.length === 0)) {
    return { status: 400, error: 'NO_ATTACHMENT' };
  }

  // 已全數領取
  if (Array.isArray(memo.attachments)) {
    const allClaimed = memo.attachments.every(a => a?.claimed === true);
    if (allClaimed) return { status: 409, error: 'ALREADY_CLAIMED' };
  } else if (memo.attachments.claimed) {
    return { status: 409, error: 'ALREADY_CLAIMED' };
  }

  const now = new Date();

  // 原子更新：把所有未領的附件設為已領，且避免過期
  const r = await Memo.updateOne(
    {
      _id: memoId,
      userId,
      deletedAt: null,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    },
    {
      $set: {
        unread: false,
        'attachments.$[a].claimed': true,
        'attachments.$[a].claimedAt': now,
      },
    },
    { arrayFilters: [{ 'a.claimed': { $ne: true } }] }
  );

  if (r.modifiedCount === 0) {
    // 可能同時被領取或過期
    return { status: 409, error: 'ALREADY_CLAIMED_OR_EXPIRED' };
  }

  // 通知（讓 polling 有事件）
  await createNotification(userId, 'memo.claimed', { memoId });

  return { status: 200, result: { memoId, claimedAt: now } };
}

async function updateMemo(userId, memoId, patch = {}) {
  const $set = {};
  if (typeof patch.unread === 'boolean') $set.unread = patch.unread;
  if (Array.isArray(patch.labels))       $set.labels = patch.labels;
  if (typeof patch.archived === 'boolean') $set.archived = patch.archived;

  if (!Object.keys($set).length) {
    return { status: 400, error: 'NO_UPDATABLE_FIELDS' };
  }

  const doc = await Memo.findOneAndUpdate(
    { _id: memoId, userId, deletedAt: null },
    { $set },
    { new: true, lean: true }
  );

  if (!doc) return { status: 404, error: 'NOT_FOUND' };

  await createNotification(userId, 'memo.updated', { memoId });

  return { status: 200, memo: doc };
}

module.exports = {
  baseFilter,
  createMemo,
  listMemos,
  getMemoByIdAndAutoRead,
  claimAttachment,
  updateMemo, 
};
