module.exports = {

    user:(app, req, res) => {

        req.assert('name','O nome é obrigatório').notEmpty();
    req.assert('email','O email não é valido').notEmpty().isEmail();

    let errors = req.validationErrors();

    if(errors) {

        app.utils.error.send(errors, req, res);

    } else {

        return true;
    
    }


    }

}