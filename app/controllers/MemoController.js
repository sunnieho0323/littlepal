// app/controllers/MemoController.js

const mongoose = require('mongoose');
const MemoService = require('../services/MemoService');
const Memo = require('../../models/Memo');
const User = require('../models/User');

function ok(res, data) { return res.json(data); }
function err(res, status, code, message) {
  return res.status(status).json({ code, message });
}

function created(res, data, path) {
  return res.status(201).location(path).json(data);
}

module.exports = {

  async list(req, res, next) {
    try {
      const userId = req.user.id;

      // normalize query
      const q = { ...req.query };
      if (q.q && !q.search) q.search = q.q;        // support ?q=
      q.page = Math.max(1, parseInt(q.page ?? '1', 10) || 1);
      q.pageSize = Math.min(50, Math.max(1, parseInt(q.pageSize ?? '10', 10) || 10));
      if (q.unread !== undefined) q.unread = (q.unread === 'true' || q.unread === true);

      const result = await MemoService.listMemos(userId, q);
      return res.json(result);
    } catch (e) { next(e); }
  },

  async create(req, res) {
    const userId = req.user.id;
    const { subject, body, attachments, expiresAt } = req.body || {};

    if (!subject) return err(res, 400, 'VALIDATION_ERROR', 'subject is required');
    if (expiresAt && isNaN(new Date(expiresAt))) return err(res, 400, 'VALIDATION_ERROR', 'invalid expiresAt');

    const isAdmin = req.user?.role === 'admin';
    const label = isAdmin ? 'system' : 'inbox';

    const memo = await MemoService.createMemo(userId, {
      subject: String(subject),
      body: body || '',
      label,
      attachments: Array.isArray(attachments) ? attachments : (attachments ? [attachments] : []),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    return created(res, memo, `/api/memos/${memo._id}`);
  },

  async getById(req, res) {
    const userId = req.user.id;
    const { status, memo, error } = await MemoService.getMemoByIdAndAutoRead(userId, req.params.id);
    if (status !== 200) return err(res, status, error);
    return ok(res, memo);
  },
  
  async update(req, res, next) {
    try {
      const uid = req.user.id;
      const { id } = req.params;
      const { status, memo, error } = await MemoService.updateMemo(uid, id, req.body || {});
      if (status !== 200) return res.status(status).json({ code: error || 'UPDATE_FAILED' });
      return res.json(memo);
    } catch (e) { next(e); }
  },

  async remove(req, res) {
    const uid = req.user.id;
    const { id } = req.params;

    const doc = await Memo.findOneAndUpdate(
      { _id: id, userId: uid, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'not found' });
    return res.sendStatus(204);
  },

  async deleteRead(req, res) {
    const uid = req.user.id;
    const r = await Memo.updateMany(
      { userId: uid, unread: false, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    );
    return res.json({ deleted: r.modifiedCount || 0 });
  },

  async send(req, res, next) {
    try {
      let { recipientId, recipientEmail, subject, body, attachments, expiresAt } = req.body || {};
      if (!recipientId && !recipientEmail) {
        return err(res, 400, 'VALIDATION_ERROR', 'recipientId or recipientEmail is required');
      }
      if (!subject) return err(res, 400, 'VALIDATION_ERROR', 'subject is required');
      if (expiresAt && isNaN(new Date(expiresAt))) return err(res, 400, 'VALIDATION_ERROR', 'invalid expiresAt');

      if (!recipientId && recipientEmail) {
        const user = await User.findOne({ email: recipientEmail.toLowerCase() }, { _id: 1 }).lean();
        if (!user) return err(res, 404, 'USER_NOT_FOUND', 'recipient email not found');
        recipientId = user._id.toString();
      }
      if (!mongoose.isValidObjectId(recipientId)) {
        return err(res, 400, 'VALIDATION_ERROR', 'recipientId must be ObjectId');
      }

      const isAdmin = req.user?.role === 'admin';
      const label = isAdmin ? 'system' : 'inbox';

      const memo = await MemoService.createMemo(new mongoose.Types.ObjectId(recipientId), {
        subject: String(subject),
        body: body || '',
        label,
        attachments: Array.isArray(attachments) ? attachments : (attachments ? [attachments] : []),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });
      return ok(res, memo);
    } catch (e) { next(e); }
  },

  async claim(req, res, next) {
    try {
      const uid = req.user.id;
      const id = req.params.id;
      const { status, result, error } = await MemoService.claimAttachment(uid, id);

      if (status !== 200) {
        // align with frontend handling: return message/code for 409/410/400
        const msg = error || (status === 409 ? 'ALREADY_CLAIMED' :
                              status === 410 ? 'MEMO_EXPIRED' :
                              status === 404 ? 'NOT_FOUND' : 'BAD_REQUEST');
        return res.status(status).json({ code: status, message: msg });
      }
      return res.json({ ok: true, ...result });
    } catch (e) { next(e); }
  },

  async claimAll(req, res) {
    const uid = req.user.id;
    const now = new Date();

    const r = await Memo.updateMany(
      {
        userId: uid,
        deletedAt: null,
        'attachments.claimed': false,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
      },
      {
        $set: {
          unread: false,
          'attachments.$[a].claimed': true,
          'attachments.$[a].claimedAt': now
        }
      },
      { arrayFilters: [{ 'a.claimed': false }] }
    );

    return res.json({ claimed: r.modifiedCount || 0 });
  },

};
