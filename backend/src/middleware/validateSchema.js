const validateSchema = (schema, property = "body") => (req, res, next) => {
    
    const {error, value} = schema.validate(req[property], {abortEarly: false, stripUnknown: true})

    
    if(error) {
        const errors = error.details.map(e => e.message)    
        return res.status(400).json({errors})
    }

    req[property] = value
    next()
    
}

module.exports = validateSchema