import dotenv from "dotenv";
//load env file.
dotenv.config();

import express from "express";
import session from "express-session";
import "../moduleAugmentations";
import MongoStore from "connect-mongo";
import { google } from "googleapis";
import config from "../config";

// declare module "express-session" {
//     interface SessionData {
//         recentSearchQuery: string;
//     }
// }

const app = express();
const port = 8000;

//create custom search
const customSearch = google.customsearch("v1");

//setting session
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}
app.use(
    session({
        resave: false,
        saveUninitialized: true,
        secret: config.SECRET ? config.SECRET : "abc",
        store: MongoStore.create({ mongoUrl: config.MONGO_URI }),
        cookie: {
            secure: process.env.NODE_ENV === "production" ? true : false,
        },
    })
);

app.get("/", (req, res) => {
    res.send("Hello world edit!");
});
app.get("/query/:query", async (req, res) => {
    const { page } = req.query;
    const { query } = req.params;
    try {
        //set api key
        const searchResult = await customSearch.cse.list({
            auth: config.GG_API_KEY,
            cx: config.GG_CX,
            q: query,
            start: Number(page ? page : 1) * 10,
            searchType: "image",
        });
        //
        const result = searchResult.data.items?.map((item) => ({
            type: item.fileFormat,
            width: item.image?.width,
            height: item.image?.height,
            size: item.image?.byteSize,
            url: item.link,
            thumbnail: {
                url: item.image?.thumbnailLink,
                width: item.image?.thumbnailWidth,
                height: item.image?.thumbnailHeight,
            },
            description: item.title,
            parentPage: item.image?.contextLink,
        }));
        req.session.recentSearchQuery = query;
        req.session.save();
        return res.json({ images: result });
    } catch (error) {
        return res.json({ error: "Something went wrong" });
    }
});
app.get("/recent", (req, res) => {
    const { session } = req;
    return res.json({
        query: session.recentSearchQuery
            ? session.recentSearchQuery
            : "No recent search",
    });
});
app.listen(port, () =>
    console.log(`Server listening at http://localhost:${port}`)
);

export default app;
