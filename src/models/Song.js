const { Schema, model } = require('mongoose');

const SongSchema = new Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, required: true },
    imageURL: { type: String, required: true },
    public_id: { type: String, required: true },
    user: { type: String, required: true }
});

module.exports = model('Song', SongSchema);