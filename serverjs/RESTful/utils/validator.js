module.exports = {

    user:(app, req, res) => {

    req.assert('_name','O nome é obrigatório').notEmpty();
    req.assert('_email','O email não é valido').notEmpty().isEmail();

    let errors = req.validationErrors();

    if(errors) {

        app.utils.error.send(errors, req, res);

    } else {

        return true;
    
    }


    }

}