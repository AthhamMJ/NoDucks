import Task from "../models/Task.js";

export const createTask = async (req, res) => {
    try{
        const {title, description, priority, isCompleted, subject, user} = req.body;

        const currentDate = new Date();

        const task = await Task.create({title, description, currentDate, priority, isCompleted, subject, user })
    }catch (error){
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}