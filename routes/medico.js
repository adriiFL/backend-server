var express = require('express');


var jwt = require('jsonwebtoken');

var mdAutentication = require('../middlewares/autenticacion');
var app = express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
//================================================
//Obtener todos los Medicos
//=================================================

app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medico) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Médico',
                        errors: err
                    });
                }
                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medico: medico,
                        total: conteo
                    });
                })
            })
});




//=============================================
//Actualizar hospital
//=============================================

app.put('/:id', mdAutentication.verificaToken, (req, res) => {

    //obtengo el id q me viene por la url
    var id = req.params.id;
    //para actualizar los datos
    var body = req.body;


    //busco en la coleccion usuario el id
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        //si el hospitañ viene nulo
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospitña con el id' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        // si encontro el hospital estamos listos para actualizar datos

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;



        //guardo la información

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });
    });


});

//================================================
//Crear un nuevo medico
//=================================================

app.post('/', mdAutentication.verificaToken, (req, res) => {

    var body = req.body;


    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario,
        hospital: body.hospital

    });

    medico.save((err, medicoGuardado) => {


        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuariotoken: req.usuario,
            hospital: req.hospital
        });
    });



});


//================================================
//Borrar un medico por el ID
//=================================================
app.delete('/:id', mdAutentication.verificaToken, (req, res) => {
    var id = req.params.id;

    //busco en la coleccion usuario el id
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { mensaje: 'No existe un medico con ese id' }
            });
        }

        return res.status(200).json({
            ok: false,
            medico: medicoBorrado
        });

    });

});

module.exports = app;