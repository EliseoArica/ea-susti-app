const songsController = {};

const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const Song = require('../models/Song');
const fs = require('fs-extra');

songsController.renderSongForm = (req, res) => {
    res.render('songs/songs_form'); // views/songs/songs_form
};

songsController.createNewSong = async (req, res) => {
    const { title, artist, album } = req.body;
    const file = req.file;

    if (file) {
        const result = await cloudinary.v2.uploader.upload(req.file.path);
        console.log(result);
        const newSong = new Song({
            title: title,
            artist: artist,
            album: album,
            imageURL: result.url,
            public_id: result.public_id
        });
        newSong.user = req.user.id;
        await newSong.save();
        //Eliminar archivo de mi servidor
        await fs.unlink(req.file.path);
        req.flash('success_msg', 'Se guardó la canción :)');
        res.redirect('/songs');
    } else {
        console.log("No hay imagen xD");
        req.flash('error_msg', 'Debes seleccionar una foto!');
        res.redirect('/songs/add');
    }
}

songsController.renderSongs = async(req, res) => {
    const songs = await Song.find({ user: req.user.id });
    res.render('songs/songs', { songs });
};

songsController.renderEditForm = async(req, res) => {
    const { id } = req.params;
    var song = [];
    const data = await Song.findById(id).lean();
    if (data.user != req.user.id) {
        req.flash('err_msg', 'Acceso no autorizado');
        return res.redirect('/songs');
    }
    song = data;
    console.log(song);
    res.render('songs/edit_form', { song });
};

songsController.updateSong = async(req, res) => {
    const { id, title, artist, album, public_id } = req.body;
    const file = req.file;
    if (file) {
        const result = await cloudinary.v2.uploader.destroy(public_id);
        if (result) { //Se borró exitosamente
            //Subir la imagen a Cloudinary
            const result2 = await cloudinary.v2.uploader.upload(req.file.path);
            console.log(result2);
            //Actualizar registro
            params = {
                title: title,
                artist: artist,
                album: album,
                imageURL: result2.url,
                public_id: result2.public_id
            };
            await Song.findByIdAndUpdate(id, params, function(err, doc) {
                if (err) {
                    console.log(err);
                    req.flash('error_msg', 'Ups! Algo ocurrió y no se pudo procesar tu solicitud');
                    res.redirect('/songs');
                } else {
                    console.log(doc);
                    req.flash('success_msg', 'Registro actualizado');
                    res.redirect('/songs');
                }
            });
        }
        await fs.unlink(req.file.path);
    } else { //No hay imagen. Procesar solo texto plano
        const paramsToUpdate = {
            title,
            artist,
            album
        };
        await Song.findByIdAndUpdate(id, paramsToUpdate, function(err, doc) {
            if (err) {
                console.log(err);
                req.flash('error_msg', 'Ups! Algo ocurrió y no se pudo procesar tu solicitud');
                res.redirect('/songs');
            } else {
                console.log(doc);
                req.flash('success_msg', 'Registro actualizado');
                res.redirect('/songs');
            }
        });
    }
}

songsController.deleteSong = async(req, res) => {
    const { id } = req.params;
    const song = await Song.findByIdAndDelete(id);
    const result = await cloudinary.v2.uploader.destroy(song.public_id);
    console.log(result);
    req.flash('success_msg', 'Canción eliminada');
    res.redirect('/songs');
}

module.exports = songsController;