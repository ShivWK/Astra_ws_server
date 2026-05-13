import { UserModel } from "../../models/user.model.js";

export const finalizeUsage = async (
    tokenUsed = 0,
    estimatedTokens,
    reservedUser
) => {
    await UserModel.findByIdAndUpdate(reservedUser._id, {
        $inc: {
            reservedTokens: -estimatedTokens,
            token: -tokenUsed,
        },
    });
};