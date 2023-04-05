import { ObjectID } from "bson";
import { User } from "interfaces";
import { verify } from "jsonwebtoken";

export const authMiddleware = async (req: any, res: any, next: any) => {
    const db = req.app.get('db')
    const authHeaders = req?.headers?.authorization || "";
    const accessToken = authHeaders.split(" ")[1];
    const temp1 = req?.headers?.[process.env.PYKEY1!];
    const temp2 = req?.headers?.[process.env.PYKEY2!];
    if (temp1 && temp2) {
    if (process.env.PYVAL1 !== temp1 || process.env.PYVAL2 !== temp2) {
        return res.status(403).send({ error: true, message: "FORBIDDEN" });
    }
    } else {
        if (!accessToken) {
          return res
            .status(401)
            .send({ error: true, message: "Please Register or Login" });
        }
        let verAcc = {};
        if (accessToken) {
            try {
                verAcc = verify(accessToken, process.env.JWT_SECRET_KEY!);
                req.verAcc = verAcc;
            } catch (err) {
                return res.status(401).send({ error: true, message: "Not Authorized" });
            }
        }
        const token = req?.headers?.authorization
        ? req?.headers?.authorization?.split(" ")?.[1]
        : "";
        let user = <User>{};
        try {
            user = <User>verify(token, process.env.JWT_SECRET_KEY!);
            const userDetails = await db.db("lilleAdmin").collection('users').findOne({_id: new ObjectID(user.id)})
            req.user = {...user, ...userDetails}
        } catch (err) {
            console.log(err)
            req.user = undefined
        }
        return next()
    }
}