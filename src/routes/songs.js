const { Router } = require('express');
const router = Router();
const { isAuthenticated } = require('../config/auth');

const { renderSongForm, createNewSong, renderSongs, renderEditForm, updateSong, deleteSong } = require('../controllers/songsController');

router.get('/songs', isAuthenticated, renderSongs);

router.get('/songs/add', isAuthenticated, renderSongForm);

router.post('/songs/add', isAuthenticated, createNewSong);

router.get('/songs/edit/:id', isAuthenticated, renderEditForm);

router.post('/songs/edit', isAuthenticated, updateSong);

router.get('/songs/delete/:id', isAuthenticated, deleteSong);

module.exports = router;