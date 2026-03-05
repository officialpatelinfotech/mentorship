import { SignJWT, jwtVerify } from "jose";

const getJwtSecretKey = () => {
    const secret = process.env.JWT_SECRET || "fallback_super_secret_for_development_purposes";
    if (!secret || secret.length === 0) {
        throw new Error("The environment variable JWT_SECRET is not set.");
    }
    return secret;
};

// Next.js Edge functions require jose instead of jsonwebtoken
export const verifyAuth = async (token) => {
    try {
        const verified = await jwtVerify(token, new TextEncoder().encode(getJwtSecretKey()));
        return verified.payload;
    } catch (err) {
        throw new Error("Your token has expired.");
    }
};

export const signToken = async (payload) => {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("2d")
        .sign(new TextEncoder().encode(getJwtSecretKey()));

    return token;
};
