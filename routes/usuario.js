var express = require('express');
var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

var mdAutentication = require('../middlewares/autenticacion');
var app = express();

var Usuario = require('../models/usuario');
//================================================
//Obtener todos los usuarios
//=================================================

app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            })
});




//=============================================
//Actualizar usuario
//=============================================

app.put('/:id', mdAutentication.verificaToken, (req, res) => {

    //obtengo el id q me viene por la url
    var id = req.params.id;
    //para actualizar los datos
    var body = req.body;


    //busco en la coleccion usuario el id
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        //si el usuario viene nulo
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        // si encontro el usuario estamos listos para actualizar datos

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        //guardo la información

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });
    });


});

//================================================
//Crear un nuevo usuario
//=================================================

app.post('/', mdAutentication.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {


        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });



});

//================================================
//Borrar un usuario por el ID
//=================================================
app.delete('/:id', mdAutentication.verificaToken, (req, res) => {
    var id = req.params.id;

    //busco en la coleccion usuario el id
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { mensaje: 'No existe un usuario con ese id' }
            });
        }

        return res.status(200).json({
            ok: false,
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;