const JWT_SECRET = "supersecretkey";

exports.requireAuth=(req, res, next)=>{
    const authHeader = req.header("Authorization");

    if(!authHeader){
        return res.status(401).json({error:"No token provided"});
    }

    const toker = authHeader.replace("Bearer", "");

    try{
        const decoded = JWT_SECRET.verify(token, JWT_SECRET);
        req.user=decoded;
        next();
        return res.json({user: {id: decoded.id, username: decode.username}})
    }
    catch{
        return res.status(401).json({error:"Token invalid"});
    }
}