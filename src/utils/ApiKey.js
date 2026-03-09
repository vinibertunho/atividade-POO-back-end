import 'dotenv/config';

const autenticarApiKey = (req, res, next) => {
    const chave = req.headers['x-api-key'];

    if (!chave || chave !== process.env.API_KEY) {
        return res.status(401).json({ error: ' Acesso não autorizado. Chave de API inválida' });
    }
    next();
};

export default autenticar;
