import {
  badRequestException,
  unAuthorizedException,
} from "../Common/Response/response.js";
import {
  decodeToken,
  getSignature,
  verifyToken,
} from "../Common/Security/token.js";
import * as dbRepo from "../DB/db.respostory.js";
import { TokenType } from "../Common/Enums/token.enum.js";
import UserModel from "../DB/Models/User.js";
import * as redisMethods from "../DB/redis.service.js";

export function authentication(tokenTypeParam = TokenType.access) {
  return async (req, res, next) => {
    const { authorization } = req.headers;

    const [BearerKey, token] = authorization.split(" ");

    if (BearerKey != "Bearer") {
      return badRequestException("invalid bearer key");
    }

    const decodedToken = decodeToken(token);

    const [userRole, tokenType] = decodedToken.aud;

    if (tokenType != tokenTypeParam) {
      return badRequestException("invalid token type");
    }

    const { accessSignature, refreshSignature } = getSignature(userRole);

    const verfiedToken = verifyToken({
      token: token,
      signature:
        tokenTypeParam == TokenType.access ? accessSignature : refreshSignature,
    });

    if (
      await redisMethods.get(
        redisMethods.blackListTokenKey({
          userId: verfiedToken.sub,
          tokenId: verfiedToken.jti,
        }),
      )
    ) {
      return unAuthorizedException("Please Login Again");
    }

    const user = await dbRepo.findById({
      model: UserModel,
      id: verfiedToken.sub,
    });

    if (!user) {
      return unAuthorizedException("Account not found or login time run out");
    }

    if (verfiedToken.iat * 1000 < user.changeCreditTime) {
      return unAuthorizedException("Please Login Again");
    }

    req.user = user;
    req.tokenPayload = verfiedToken;

    next();
  };
}
