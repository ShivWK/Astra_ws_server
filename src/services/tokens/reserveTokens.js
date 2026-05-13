import { UserModel } from "../../models/user.model.js";

export async function reserveTokens(userId, estimatedTokens) {
    const user = await UserModel.findOneAndUpdate({
        _id: userId,
        role: { $ne: "admin" },

        $expr: {
            $gte: [
                { $subtract: ["$token", "$reservedTokens"] },
                estimatedTokens
            ]
        }
    },
        {
            $inc: {
                reservedTokens: estimatedTokens
            }
        },

        {
          returnDocument: "after"
        }
    )

    return user;
}