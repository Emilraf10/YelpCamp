module.exports = function wrapAsync(fn){ //Declaramos una funcion para manejo de errores. *averiguar mas como funciona*
    return function(req, res, next){
        fn(req, res, next).catch(e => next(e));
    }
}
