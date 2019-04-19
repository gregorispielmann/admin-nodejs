module.exports = {

    send: (e, req, res, code = 400) => {

        console.log('error: ${e}');
            res.status(code).json({
                erro: e
            });

    }

}