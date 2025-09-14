// app/controllers/MemoController.js

/*
const MemoService = require('../services/MemoService');
exports.list = async (req,res,next)=>{ try{ res.json(await MemoService.list(req.user?.id)); }catch(e){next(e);} };
exports.create = async (req,res,next)=>{ try{ res.status(201).json(await MemoService.create(req.user?.id, req.body)); }catch(e){next(e);} };
exports.update = async (req,res,next)=>{ try{ res.json(await MemoService.update(req.user?.id, req.params.id, req.body)); }catch(e){next(e);} };
exports.remove = async (req,res,next)=>{ try{ await MemoService.remove(req.user?.id, req.params.id); res.sendStatus(204);}catch(e){next(e);} };
exports.complete = async (req,res,next)=>{ try{ res.json(await MemoService.complete(req.user?.id, req.params.id)); }catch(e){next(e);} };
exports.notify = async (req,res,next)=>{ try{ res.json(await MemoService.notify(req.user?.id, req.params.id)); }catch(e){next(e);} };
*/

const mongoose = require('mongoose');
const MemoService = require('../services/MemoService');
const Memo = require('../../models/Memo');

function ok(res, data) { return res.json(data); }
function err(res, status, code, message) {
  return res.status(status).json({ code, message });
}

module.exports = {
  async create(req, res) {
    const userId = req.user.id;
    const { subject, body, label, attachments, expiresAt } = req.body || {};

    if (!subject) return err(res, 400, 'VALIDATION_ERROR', 'subject is required');
    if (expiresAt && isNaN(new Date(expiresAt))) return err(res, 400, 'VALIDATION_ERROR', 'invalid expiresAt');

    const memo = await MemoService.createMemo(userId, {
      subject: String(subject),
      body: body || '',
      label: label || 'inbox',
      attachments: Array.isArray(attachments) ? attachments : (attachments ? [attachments] : []),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });
    return ok(res, memo);
  },

  async list(req, res) {
    const userId = req.user.id;
    const q = req.query.q; if (q && !req.query.search) req.query.search = q;
    const result = await MemoService.listMemos(userId, req.query);
    return res.json(result);
  },

  async getById(req, res) {
    const userId = req.user.id;
    const { status, memo, error } = await MemoService.getMemoByIdAndAutoRead(userId, req.params.id);
    if (status !== 200) return err(res, status, error);
    return ok(res, memo);
  },

  async claim(req, res) {
    try {
      const { status, result, error } =
        await MemoService.claimAttachment(req.user.id, req.params.id);

      if (status !== 200) {
        return res.status(status).json({ code: status, message: error || 'failed' });
      }
      // 正常情況下回傳：{ ok: true, memoId, claimedAt }
      return res.json({ ok: true, ...result });
    } catch (e) {
      // 萬一 Service 丟出未攔截錯誤
      return res.status(500).json({ code: 500, message: e.message || 'internal error' });
    }
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

  async send(req, res, next) {
    try {
      const { recipientId, subject, body, label, attachments, expiresAt } = req.body || {};
      if (!recipientId) return err(res, 400, 'VALIDATION_ERROR', 'recipientId is required');
      if (!mongoose.isValidObjectId(recipientId)) return err(res, 400, 'VALIDATION_ERROR', 'recipientId must be ObjectId');
      if (!subject) return err(res, 400, 'VALIDATION_ERROR', 'subject is required');
      if (expiresAt && isNaN(new Date(expiresAt))) return err(res, 400, 'VALIDATION_ERROR', 'invalid expiresAt');

      const memo = await MemoService.createMemo(
        new mongoose.Types.ObjectId(recipientId),
        {
          subject: String(subject),
          body: body || '',
          label: label || 'inbox',
          attachments: Array.isArray(attachments) ? attachments : (attachments ? [attachments] : []),
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        }
      );
      return ok(res, memo);
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


};
