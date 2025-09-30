const router = require('express').Router();
const PetController = require('../controllers/PetController');

router.get('/by-owner/:ownerId', PetController.getMine);
router.get('/:id', PetController.getById);        

router.post('/', PetController.create);
router.delete('/by-owner/:ownerId', PetController.delete);

router.patch('/:id/feed', PetController.feed);
router.patch('/:id/drink', PetController.drink);
router.patch('/:id/play', PetController.play);

module.exports = router;
