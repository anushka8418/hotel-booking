import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        };

        // req.body is now a Buffer because we used express.raw() in server.js
        // We convert it to a string for verification
        const payload = req.body.toString();
        
        await whook.verify(payload, headers);

        // Parse the JSON manually after verification
        const evt = JSON.parse(payload);
        const { data, type } = evt;

        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    // Fix: Map name correctly (combining first and last name as example)
                    username: data.first_name + " " + data.last_name, 
                    // Fix: Map image correctly
                    image: data.image_url, 
                    // Fix: Initialize the array
                    recentSearchedCities: [] 
                };
                await User.create(userData);
                break;
            }
            case "user.updated": {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    username: data.first_name + " " + data.last_name,
                    image: data.image_url,
                };
                await User.findByIdAndUpdate(data.id, userData);
                break;
            }
            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                break;
            }
            default:
                break;
        }
        res.json({ success: true, message: "Webhook Received" });

    } catch (error) {
        console.log("Webhook Error:", error.message);
        res.json({ success: false, message: error.message });
    }
}

export default clerkWebhooks;