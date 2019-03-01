var express = require('express');


var jwt = require('jsonwebtoken');

var mdAutentication = require('../middlewares/autenticacion');
var app = express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
//================================================
//Obtener todos los Hospitales
//=================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)

    .populate('usuario', 'nombre email')

    .exec(
        (err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando Hospital',
                    errors: err
                });
            }
            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospital: hospital,
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
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        //si el hospitañ viene nulo
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospitña con el id' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        // si encontro el hospital estamos listos para actualizar datos

        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = req.usuario._id;



        //guardo la información

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });
    });


});

//================================================
//Crear un nuevo hospital
//=================================================

app.post('/', mdAutentication.verificaToken, (req, res) => {

    var body = req.body;


    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario

    });

    hospital.save((err, hospitalGuardado) => {


        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuariotoken: req.usuario
        });
    });



});

//================================================
//Borrar un hospital por el ID
//=================================================
app.delete('/:id', mdAutentication.verificaToken, (req, res) => {
    var id = req.params.id;

    //busco en la coleccion usuario el id
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { mensaje: 'No existe un hospital con ese id' }
            });
        }

        return res.status(200).json({
            ok: false,
            hospital: hospitalBorrado
        });

    });

});

module.exports = app;