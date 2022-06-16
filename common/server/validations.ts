import Joi from 'joi';

export
const ObjectIdValidation = Joi
	.string()
	.hex()
	.length(24);
