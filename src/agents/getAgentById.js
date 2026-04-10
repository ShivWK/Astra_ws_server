import { UserAgentsModel } from "../models/userAgent.model.js"

export const getAgentById = async (id) => {
    const agent = await UserAgentsModel.findById(id);

    if (agent) return agent;
    return false
}