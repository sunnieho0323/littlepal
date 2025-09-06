// app/controllers/MemoController.js
const MemoService = require('../services/MemoService');
exports.list = async (req,res,next)=>{ try{ res.json(await MemoService.list(req.user?.id)); }catch(e){next(e);} };
exports.create = async (req,res,next)=>{ try{ res.status(201).json(await MemoService.create(req.user?.id, req.body)); }catch(e){next(e);} };
exports.update = async (req,res,next)=>{ try{ res.json(await MemoService.update(req.user?.id, req.params.id, req.body)); }catch(e){next(e);} };
exports.remove = async (req,res,next)=>{ try{ await MemoService.remove(req.user?.id, req.params.id); res.sendStatus(204);}catch(e){next(e);} };
exports.complete = async (req,res,next)=>{ try{ res.json(await MemoService.complete(req.user?.id, req.params.id)); }catch(e){next(e);} };
exports.notify = async (req,res,next)=>{ try{ res.json(await MemoService.notify(req.user?.id, req.params.id)); }catch(e){next(e);} };
